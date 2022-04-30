
SERVICE_NAME="documentsConsole"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"


echo "### NPM INSTALL"
npm install

echo "### BUILDING FRONTEND"
npm run build

echo "\n### CREATING SERVICE"

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
Description=Documents Console

[Service]
Type=simple
Environment="FRONTEND_DIST_DIR=./frontend/dist"
WorkingDirectory=$PWD
ExecStart=node ./backend/

[Install]
WantedBy=multi-user.target
EOM

systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME