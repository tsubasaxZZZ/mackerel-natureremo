import { AzureFunction, Context } from "@azure/functions"
import * as Axios from 'axios';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    let timeStamp = new Date().toISOString();

    if (myTimer.IsPastDue) {
        context.log('Timer function is running late!');
    }

    let devices = await NatureRemoDevice.getDevicesData();
    context.log(devices);
    let d = await MackerelAPI.postServiceMetric(devices[0]);
    context.log(d);

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
                }

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
            let { hu, il, te } = device["newest_events"];
            const remoDevice = new NatureRemoDevice(device["id"], device["name"], hu["val"], il["val"], te["val"]);
            remoDevices.push(remoDevice);
        }

        return remoDevices;
    }

    constructor(public id: string, public name: string, public hu: number, public il: number, public te: number) {
    }

}
export default timerTrigger;
