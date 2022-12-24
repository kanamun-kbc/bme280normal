// Remote Example1 - controller
import {RelayServer} from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

window.getData = getData;

var channel;
onload = async function(){
	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" );
	channel = await relay.subscribe("chirimenBMEdteam");
	messageDiv.innerText="web socketリレーサービスに接続しました";
	/*onmessageはメッセージを受信したときに起きるイベント*/
	/*main_remote_bme280の計測データを受け取り, 関数getMessageを起動(2'番main_remote_bme280.jsから受け取り)*/
	channel.onmessage = getMessage;
}

/*計測されたデータを受け取って, htmlへ表示するためのもの(htmlに向けてidにテキスト代入*/
function getMessage(msg){ // メッセージを受信したときに起動する関数
	/*mdataに受け取った計測データを代入*/
	var mdata = msg.data;
	/*messageDivというhtmlのidにデータをテキスト形式で入れる*/
	messageDiv.innerText = JSON.stringify(mdata);
	console.log("mdata:",mdata);
	/*それぞれ対応しているhtmlのidに温度湿度気圧をテキスト形式で代入*/
	temTd.innerText = mdata.temperature;
	humTd.innerText = mdata.humidity;
	preTd.innerText = mdata.pressure;
}

/*共通のチャンネルにGET SENSOR DATAを送信する*/
function getData(){ // get microbit's internal sensor data
	/*"GET SENSOR DATA"というテキストを送信(1番main_remote_bme280.jsへ)*/
	channel.send("GET SENSOR DATA");
}
