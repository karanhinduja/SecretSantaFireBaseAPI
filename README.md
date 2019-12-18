# [Secret Santa API's](https://karanhinduja.github.io/SecretSantaProject/) [![version][version-badge]][CHANGELOG]

**[Service List]**

**[1] Login**
Service needs to validate the CompanyCode available along with PSNO & correct password.
```
Post
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

**[2] Registration**
Service needs to 
    Create New Company if does not exist
    Create New Department if does not exist
    Create new User
    Make the User Admin if Company is been created
    Else the user will not be admin

```
Post
(/api/v1/Register)
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


**[3] GetDepartmentList**
Service needs to 
    Get the list of all the available department

```
Get
(/api/v1/GetDepartmentList)
```
Request Paramaters
```
{
    CompanyCode:'LTI'
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data: [{Name:'DevOps'}, {Name:'SysAdmin'}]
}
```



**[4] GetCompanyList**
Service needs to 
    Get the list of all the available Company from CompanyMaster

```
Get
(/api/v1/GetCompanyList)
```
Request Paramaters
```
---No paramater
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data: [{CompanyCode:'LTI'}, {CompanyCode:'CMS'}]
}
```


**[5] UpdateWishList**
Service needs to 
    Update/Add the wish list passed, (delete the availabe wishlist of the emp & add the new one's)

```
Post
(/api/v1/UpdateWishList)
```
Request Paramaters
```
{
    CompanyCode:'LTI',
    PSNo:'10663876',
    WishList:[{Description:''}, {Description:''}, {Description:''}]
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:''
}
```



**[6] UpdateProfile**
Service needs to 
    Update the emp profile

```
Post
(/api/v1/UpdateProfile)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
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





**[7] Get Recipient Profile**
Service needs to 
    Get the Recipient profile Details 

```
Get
(/api/v1/GetRecipientProfile)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "PSNo":'10663876'
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data:{
        "Department": "DevOps",
        "Email": "karan.hinduja@lntinfotech.com",
        "FullName": "Karan Hinduja",
        "Mobile": 9920329141,
        "PSNo": "10663876"
  }
}
```





**[8] Get Recipient Wishlist**
Service needs to 
    Get the Recipient Wishlist Details 

```
Get
(/api/v1/GetRecipientProfile)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "PSNo":'10663876'
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data:[{Description:''}, {Description:''}, {Description:''}]
}
```




**[9] GetMySecretSantaProfile**
Service needs to 
    Get the Emp's  SecretSanta Profile Details

```
Get
(/api/v1/GetMySecretSantaProfile)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "PSNo":'10663876'
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data:{
        "Department": "DevOps",
        "Email": "karan.hinduja@lntinfotech.com",
        "FullName": "Karan Hinduja",
        "Mobile": 9920329141,
        "PSNo": "10663876",
        "IsAdmin":True
  }
}
```



**[10] StartMatching**
Service needs to 
    The matching process will be initiated by the admin

```
Post
(/api/v1/StartMatching)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "PSNo":'10663876',
  "Department":[{Name:"DevOps"}, {Name:"SysAdmin"}]
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:''
}
```





**[11] Get ALL Users**
Service needs to 
    The matching process will be initiated by the admin

```
GET
(/api/v1/GetAllUsers)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "PSNo":'10663876'
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    Data:[
        {
            "Department": "DevOps",
            "Email": "karan.hinduja@lntinfotech.com",
            "FullName": "Karan Hinduja",
            "Mobile": 9920329141,
            "PSNo": "10663876",
            "IsAdmin":True
        },
        {
            "Department": "DevOps",
            "Email": "karan.hinduja@lntinfotech.com",
            "FullName": "Karan Hinduja",
            "Mobile": 9920329141,
            "PSNo": "10663876",
            "IsAdmin":False
        }
        ]
}
```



**[12] Update User(s) Admin Status**
Service needs to 
    update the IsAdmin property for the specific user's

```
POST
(/api/v1/UpdateUserAdminStatus)
```
Request Paramaters
```
{
  "CompanyCode": "Praxis",
  "Data":[
      {
        "PSNo":'10663876',
        "IsAdmin":True
      },
      {
        "PSNo":'10663876',
        "IsAdmin":True
      },
  ]
  
}
```
Response Paramaters

```
{
    Success:True | False,
    Message:'',
    
}
```


