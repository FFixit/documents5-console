docker build -t documents-console . 
docker run -d --name documents-console --network="host" documents-console