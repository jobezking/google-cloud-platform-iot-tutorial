# google-cloud-platform-iot-tutorial
export PROJECT_ID="iot-gcp-test"    #has to be unique
gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID

gcloud services enable pubsub.googleapis.com

export pub_topic="rasp-pub"
export subscription="rasp-sub"
gcloud pubsub topics create $pub_topic
gcloud pubsub subscriptions create $subscription --topic $pub_topic

export registry_name="swa_registry"
export region="us-central1"
gcloud iot registries create $registry_name --region=$region --event-notification-config=topic=$pub_topic --enable-mqtt-config --enable-http-config

mkdir certs && cd certs
openssl req -x509 -newkey rsa:2048 -keyout rasp_private.pem -nodes -out rasp_cert.pem -subj "/CN=unused"
#Upload contents of rasp_certs.pem to new device page

mkdir rasp-gcp && cd rasp-gcp
npm init -y
npm install jsonwebtoken --save
npm install bme280 --save
npm install mqtt --save

#Save mqtt-to-gcp.js to rasp-gcp
#On line 6 set project name for var projectId = "*****";
#On line 17 set proper path to certificate for var privateKeyFile = "/home/jobezking/rasp-gcp/certs/rasp_private.pem";

node mqtt-to-gcp.js
