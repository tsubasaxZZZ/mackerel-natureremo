## 環境

- Node.js 10.x
- Azure Functions Core Tools 3.x

## ローカルからのデプロイの仕方

1. local.settings.json を設定する
    - VS Code の Functions 拡張で既存の関数の設定をダウンロードすると簡単
2. VS Code の "Deploy to Function app..." を使ってデプロイ

## 構成サンプル

以下を設定する。
- Nature Remo の API キー
- Mackerel の API キー
- Event Hubs の API キー

```json
{
  "IsEncrypted": false,
  "Values": {
    "APPINSIGHTS_INSTRUMENTATIONKEY": "959e5bc4-842e-4d7f-8ce6-xxxxxxxxx",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "InstrumentationKey=959e5bc4-842e-4d7f-8ce6-xxxxxxxx;IngestionEndpoint=https://southeastasia-0.in.applicationinsights.azure.com/",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;AccountName=xxxxxxxxx;AccountKey=ZXO9f5khOUTUK6aXDYf/KASSCXIJ9DwPAFBAN/KBqkHQHbM21WXcsa75Ve5UV7JJfV7d3nMnxxxxxxxxxxxxxx==;EndpointSuffix=core.windows.net",
    "FUNCTIONS_EXTENSION_VERSION": "~3",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "WEBSITE_RUN_FROM_PACKAGE": "1",
    "NatureRemoAPI_KEY": "7Fz5-o2iT6Z_fYUUFXL1nEBNtwb8YU4WGDM_Q7QYX_o.4jx8lqBKhEJ4h8TRNybm66Yrgxxxxxxxxxxxxxxxxxx",
    "MackerelAPI_KEY": "4153E1rXoX2fRgwxqLvmxbepYrwxxxxxxxxxxxxxxxxxxxx",
    "Mackerel_ServiceName": "nomupro",
    "EventHubConnectionString" : "Endpoint=sb://eventhub.servicebus.windows.net/;SharedAccessKeyName=sak;SharedAccessKey=NNIhP6vH86IMD5+X5llvj9ROeGWs/+GTA1xxxxxxxxx=;EntityPath=natureremo"
  }
}
```