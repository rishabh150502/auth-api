# auth-api

routers

post-requests:

/api/auth/signUp

data:{first,last,email,password}


/api/auth/signUp/verify

data:{email,otp}


/api/auth/signIn

data:{email,password}


/api/resetpassword/forgotpassword

data:{email}


/api/resetpassword/forgotPassword/verify

data:{email,otp}


/api/resetpassword/changepassword

data:{email,newPassword}
