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
	channel.onmessage = transmitSensorData;
}

async function transmitSensorData(messge){
	console.log(messge.data);
	if ( messge.data =="GET SENSOR DATA"){
		var sensorData = await readData();
		channel.send(sensorData);
		console.log(JSON.stringify(sensorData));
	}
}

async function readData(){
	var bmeData = await bme.readData();
	console.log('bmeData:', bmeData);
	console.log("temperature:" + bmeData.temperature + "degree  <br>humidity:"+ bmeData.humidity + "% <br>pressure" + bmeData.pressure);
	return(bmeData);
}

connect();