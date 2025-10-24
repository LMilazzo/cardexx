# Note To Self EC2 Implementation Steps

```
Launch EC2 instance

SSH into instance 

Using pem file and public DNS

sudo apt-get update

sudo apt install -y python3 pip nginx

create nginx config file in /etc/nginx/sites-enabled/fastapi_nginx

copy paste contents here adding your public ipv4

sudo service nginx restart

git clone repo

scp needed files

sudo apt install python3.12-venv

python3 -m venv env_name

source env/bin/activate

pip install -r dependencies.txt

sudo apt update
sudo apt install -y libgl1

pip intall python-multipart
pip install fastparquet
pip install guvicorn

make systemmd file
sudo nano /etc/systemd/system/fastapi.service

sudo systemctl daemon-reload
sudo systemctl start fastapi
sudo systemctl enable fastapi

Check
sudo systemctl status fastapi
sudo journalctl -u fastapi -f
```

