
SERVICE_NAME="documentsConsole"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
LOG_DIRECTORY="/var/log/${SERVICE_NAME}"


echo "### NPM INSTALL"
npm install


echo "\n### CREATING SERVICE"
mkdir -p $LOG_DIRECTORY
chmod o+rw $LOG_DIRECTORY

if [ -f $FILE ]; then
    echo "Service already exists, removing service..."
    systemctl stop $SERVICE_NAME
    systemctl disable $SERVICE_NAME
    rm /etc/systemd/system/$SERVICE_NAME
    rm /usr/lib/systemd/system/$SERVICE_NAME
    systemctl daemon-reload
    systemctl reset-failed
fi

cat > $SERVICE_FILE <<EOM
[Unit]
Description=Felix Documents Console

[Service]
Type=simple
WorkingDirectory=$PWD
ExecStart=node $PWD | tee -a $LOG_DIRECTORY/output.log

[Install]
WantedBy=multi-user.target
EOM

systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME