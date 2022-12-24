/*リモートのsht30のラズパイ側→リモートのbme280へ*/
// Remote Example5 - reciever
// for CHIRIMEN with nodejs
import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
/*ここをSHTではなくBMEに*/
import BME280 from "@chirimen/bme280";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
/*relayServerはウェブアプリ間でリアルタイム性の高いデータのやり取りを仲介*/
/*ライブラリRelayServer.jsを読み込み*/
import {RelayServer} from "./RelayServer.js";

var channel;
var bme;

async function connect(){
	// I2Cポートと、I2CデバイスSHT30の初期化
	/*Web I2C APIを利用するためのI2CAccessインタフェースを取得*/
	var i2cAccess = await requestI2CAccess();
	/*ラズパイゼロで利用可能なI2Cポート番号は1番だけ*/
  /*ポート番号に1を指定してportオブジェクトを取得*/
	var i2cPort = i2cAccess.ports.get(1);
	/*ドライバーライブラリを使ってBME280を操作するためのインスタンス生成*/
	bme = new BME280(i2cPort);
	/*ドライバーライブラリのインスタンス(bme280)の*/
  /*init()メソッドを通じてI2Cポートを開いてセンサーを初期化*/
	await bme.init();
	
	// webSocketリレーの初期化
	/*リレーサービスインスタンスを取得する*/
	/*chirimentestのところは利用したいサービス名*/
	/*chirimenSocketのところはサービスを利用するためのトークン*/
	var relay = RelayServer("chirimentest", "chirimenSocket" , nodeWebSocketLib, "https://chirimen.org");
	/*チャンネルの取得*/
	/*chirimenBMEdteamのところはチャンネル名*/
	/*subscribe()はリレーサーバと通信して登録を行う非同期関数*/
	/*理由は通信に時間がかかるから*/
	channel = await relay.subscribe("chirimenBMEdteam");
	console.log("web socketリレーサービスに接続しました");
	/*onmessageはメッセージを受け取ったときに起きるイベント*/
	/*pc.jsのsend("GET SENSOR DATA")を受け取り(1'番pc.jsから受け取り)関数transmitsensorDataが起動*/
	channel.onmessage = transmitSensorData;
}

/*pc.jsから"GET SENSOR DATA"を受け取って, 共通のチャンネルに計測データを送信*/
async function transmitSensorData(messge){
	console.log(messge.data);
	if ( messge.data =="GET SENSOR DATA"){
	/*GET SENSOR DATAというテキストの受け取りに成功した場合*/
	/*ここで10秒ごとにセンサーデータを送る*/
		while(true){
			/*変数sensorDataに計測データを代入*/
			var sensorData = await readData();
			/*計測データを送信(2番pc.jsへ)*/
			channel.send(sensorData);
			console.log(JSON.stringify(sensorData));
			/*10秒ごと*/
			await sleep(10000);
		}
	}
}

/*読み込んだデータの確認とリターン*/
async function readData(){
	/*bmeDataに読み込んだデータを入れる*/
	var bmeData = await bme.readData();
	/*デバックとして, どう表示されるかの確認*/
	console.log('bmeData:', bmeData);
	/*デバックとして3つのパラメータを分けて, どう表示されるかの確認*/
	console.log("temperature:" + bmeData.temperature + "degree  <br>humidity:"+ bmeData.humidity + "% <br>pressure" + bmeData.pressure);
	/*呼び出された非同期関数readDataは読み込んだデータを返す*/
	return(bmeData);
}

connect();