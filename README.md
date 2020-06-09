# Server

Server for SKKU 2020 Spring Semester Capstone Design Team 08 Snoot

url : http://34.64.124.225

## Features
### /login
- Post
- 로그인
- Receive
	- email
	- pw_hashed
		※ pw_hashed := EtcPackage.Utils.hash(email, password)
- Send
	- 200 : Success
		- user_id
		- email
		- token
		- first_name
		- last_name
		- phone_number
		- pets [Array]
			- pet_id
			- name
			- species
			- description
			- photo_id
			- arduino_mac
			- pi_mac
	- 400 : Else
	- 401 : Invalid Params


### /signup
- Post
- 회원가입
- Receive
	- first_name
	- last_name
	- email
	- phone_number
	- pw_hashed
- Send
	- 200 : Success
	- 400 : Else
	- 401 : Invalid Params


### /forgot-password
- Get
- 비밀번호 갱신용 code 이메일로 전송
- Receive
	- email
- Send
	- 200 : Success
	- 400 : Else
	- 401 : Invalid Params


### /verify-code
- Get
- 비밀번호 갱신용 code 검증
- Receive
	- email
	- code
- Send
	- 200 : Success
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Auth
	- 405 : Expired Auth


### /change-password
- Post
- 비밀번호 변경
- Receive
	- pw_hashed
	- email
	- code
- Send
	- 200 : Success
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Auth
	- 405 : Expired Auth


### /add-pet
- Post
- 애완동물 등록 (사진 제외)
- Receive
	- token
		※ header["x-access-token"]에 설정
	- user_id
	- email
	- name
	- species
	- description
	- arduino_mac
	- pi_mac
- Send
	- 200 : Success
		- pet_id
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Token
	- 405 : Expired Token


### /upload-img
- Post
- 애완동물 사진 업로드
- Receive
	- token
	- user_id
	- pet_id
	- photo
- Send
	- 200 : Success
		- photo_id
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Token
	- 405 : Expired Token


### /download-img
- Get
- 애완동물 사진 다운로드
- Receive
	- token
	- user_id
	- pet_id
	- photo_id
- Send
	- 200 : Success
		- photo [stream]
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Token
	- 405 : Expired Token