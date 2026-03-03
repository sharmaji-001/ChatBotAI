 PART 1 — BACKEND SETUP
**
✅ Step 1 — Python Install Karo**

Jao → https://python.org/downloads
Python 3.11 download karo
Installer open karo
Sabse pehle neeche wala checkbox tick karo 👇

☑️ Add Python to PATH

"Install Now" click karo

Verify karo — Command Prompt kholo (Win + R → cmd) aur type karo:
python --version
Output aana chahiye:
Python 3.11.x

**✅ Step 2 — Folder Banao**

C:\Projects mein ek folder banao — naam rakho rapt-backend
VS Code open karo
File → Open Folder → rapt-backend select karo
Terminal kholo: Ctrl + `


✅ Step 3 — Virtual Environment Banao
Terminal mein type karo:
bashpython -m venv venv
Phir activate karo:
bashvenv\Scripts\activate
```
Terminal kuch aisa dikhega:
```
(venv) C:\Projects\rapt-backend>

(venv) dikh raha hai matlab sab sahi hai ✅


**✅ Step 4 — Libraries Install Karo**
bashpip install fastapi uvicorn boto3 pydantic
Thoda time lagega — sab install ho jaega.

**✅ Step 5 — main.py Banao**
VS Code mein New File button click karo, naam rakho main.py
Usme woh pura code paste karo jo tumhare paas hai (jo tumne mujhe pehla bheja tha).

**✅ Step 6 — AWS Setup Karo**
bashpip install awscli
aws configure
```

Yeh cheezein maangega — apni AWS keys daalo:
```
AWS Access Key ID:     AKIA...........
AWS Secret Access Key: xxxxxxxxxxxxxxx
Default region name:   us-east-1
Default output format: json

Keys milegi → AWS Console → IAM → Users → Security Credentials

**✅ Step 7 — Backend Chalao**
bashuvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Yeh dikhna chahiye:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 ✅
INFO:     Application startup complete.
```
**```
http://localhost:8000/docs**
---
