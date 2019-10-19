import { AzureFunction, Context } from "@azure/functions"
import * as Axios from 'axios';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    let timeStamp = new Date().toISOString();

    if (myTimer.IsPastDue) {
        context.log('Timer function is running late!');
    }

    let devices = await NatureRemoDevice.getDevicesData();
    context.log(devices);
    for (const device of devices) {
        let d = await MackerelAPI.postServiceMetric(device);
        context.log(d);
    }

    context.log('Timer trigger function ran!', timeStamp);
};

// Mackerel API アクセス用のクラス
class MackerelAPI {
    static APIKEY: string | undefined = process.env['MackerelAPI_KEY'];
    static SERVICENAME: string | undefined = process.env['Mackerel_ServiceName'];
    static api = Axios.default.create({
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': MackerelAPI.APIKEY
        }
    });

    // サービスメトリックに投稿する
    static async postServiceMetric(remoDevice: NatureRemoDevice) {
        // UNIX タイムスタンプ(秒)を取得
        const now = Math.floor(new Date().getTime() / 1000);
        const { data } = await MackerelAPI.api.post(
            `https://mackerel.io/api/v0/services/${MackerelAPI.SERVICENAME}/tsdb`,
            [
                // 輝度
                {
                    name: `${remoDevice.id}.il`,
                    time: now,
                    value: remoDevice.il
                },
                // 温度
                {
                    name: `${remoDevice.id}.te`,
                    time: now,
                    value: remoDevice.te
                },
                // 湿度
                {
                    name: `${remoDevice.id}.hu`,
                    time: now,
                    value: remoDevice.hu
                },
                // 人感
                {
                    name: `${remoDevice.id}.mo`,
                    time: now,
                    value: remoDevice.mo
                },
            ]
        );
        return data;
    }
}

class NatureRemoAPI {
    static TOKEN: string | undefined = process.env['NatureRemoAPI_KEY'];
    static api = Axios.default.create({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NatureRemoAPI.TOKEN}`
        }
    });
}

class NatureRemoDevice {
    public static async getDevicesData() {

        const { data } = await NatureRemoAPI.api.get("https://api.nature.global/1/devices");

        let remoDevices: NatureRemoDevice[] = [];

        // 複数デバイスへの対応のため、データでループ
        for (const device of data) {
            console.log(device);
            let { hu, il, te, mo } = device["newest_events"];
            // 人感センサーの場合は crated_at で判別
            let mo_remo_date = Date.parse(mo["created_at"]);
            // - 1 分以上前の場合は 0 とする
            // - ミリ秒のため、1000 ms / 60 sec = 経過分を出す
            if ((new Date().getTime() - mo_remo_date) / 1000 / 60 > 1) {
                mo["val"] = 0;
            }
            const remoDevice = new NatureRemoDevice(device["id"], device["name"], hu["val"], il["val"], te["val"], mo["val"]);
            remoDevices.push(remoDevice);
        }

        return remoDevices;
    }

    constructor(public id: string, public name: string, public hu: number, public il: number, public te: number, public mo: number) {
    }

}
export default timerTrigger;
