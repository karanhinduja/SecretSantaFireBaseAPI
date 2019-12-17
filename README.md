# [Secret Santa Application](https://karanhinduja.github.io/SecretSantaProject/) [![version][version-badge]][CHANGELOG]

**[Service List]**

**[Login]**
```
(/api/v1/Login)
```
Request Paramaters
```
{
    CompanyCode:'',
    PSNo:'',
    Password:''
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:''
}
```

**[Registration]**
```
(api/Register)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "Address": "Goregoan",
  "EmpMaster": {
    "Department": "DevOps",
    "Email": "karan.hinduja@lntinfotech.com",
    "FullName": "Karan Hinduja",
    "Mobile": 9920329141,
    "PSNo": "10663876",
    "Password": "1234"
  }
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:''
}
```


