# Server

Server for SKKU 2020 Spring Semester Capstone Design Team 08 Snoot

url : http://34.64.124.225

## Server Architecture

- GCP VM Instance
	- Ubuntu 20.04 LTS
- Node.js
- Mariadb

## DB Structure
### User
- id
	- int
	- primary key
	- auto_increment
- email
	- varchar(200)
	- unique
	- not null
- pw_hashed
	- char(64)
	- not null
- salt
	- char(10)
	- not null
- first_name
	- varchar(200)
- last_name
	- varchar(200)
- phone_number
	- varchar(50)

`create table User(id int primary key auto_increment, email varchar(200) unique not null, pw_hashed char(64) not null, salt char(10) not null, first_name varchar(200), last_name varchar(200), phone_number varchar(50));`

### Pet
- pet_id
	- int
	- primary key
	- auto_increment
- user_id
	- int
	- not null
- name
	- varchar(200)
	- not null
- species
	- varchar(200)
	- not null
- description
	- varchar(500)
- photo_id
	- int
- arduino_mac
	- char(17)
	- not null
- pi_mac
	- char(17)
	- not null

`create table Pet(pet_id int primary key auto_increment, user_id int not null, name varchar(200) not null, species varchar(200) not null, description varchar(500), photo_id int, arduino_mac char(17) not null, pi_mac char(17) not null);`

### Photo
- photo_id
	- int
	- primary key
	- auto_increment
- user_id
	- int
	- not null
- pet_id
	- int
	- not null
- path
	- varchar(200)
	- not null

`create table Photo(pet_id int primary key auto_increment, user_id int not null, pet_id int not null, path varchar(200) not null);`

### Location
- pet_id
	- int
	- primary key
- time
	- timestamp
	- primary key
- location
	- varchar(50)
	- not null

`create table Location(pet_id int, time timestamp, location varchar(50) not null, primary key(pet_id, time));`

### User_Auth
- auth_id
	- int
	- primary key
	- auto_increment
- user_id
	- int
	- not null
- email
	- varchar(200)
	- not null
- code
	- char(8)
	- not null
- created_time
	- timestamp
	- not null
- is_verified
	- bool
- verified_time
	- timestamp

`create table User_Auth(auth_id int auto_increment primary key, user_id int not null, email varchar(200) not null, code char(8) not null, created_time timestamp not null, is_verified bool, verified_time timestamp);`

## Features
### /login
- Post
- 로그인
- Receive
	- email
	- pw_hashed : EtcPackage.Utils.hash(email, password)
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
	- pw_hashed : EtcPackage.Utils.hash(email, password)
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
	- pw_hashed : EtcPackage.Utils.hash(email, password)
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
	- token : header["x-access-token"]에 설정
	- user_id
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
	- token : header["x-access-token"]에 설정
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
	- token : header["x-access-token"]에 설정
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

### /set-location
- Get
- 애완동물 위치 등록 (RaspberryPi -> Server)
- Receive
	- wifi_mac : 내부적으로는 pi_mac으로 처리됨
	- location
		- lon : longitude
		- lat : latitude
	- time : YYYY-MM-DD HH:MM:SS 포멧으로 전송. GMT+0000 사용.
- Send
	- 200 : Success
	- 400 : Else
	- 401 : Invalid Params

### /get-location
- Get
- 애완동물 가장 최근 위치 받기 (Server -> App)
- Receive
	- token : header["x-access-token"]에 설정
	- pet_id
- Send
	- 200 : Success
		- time : YYYY-MM-DD HH:MM:SS 포멧으로 전송. GMT+0900 사용.
		- location
			- lon : longitude
			- lat : latitude
	- 400 : Else
	- 401 : Invalid Params
	- 403 : Invalid Token
	- 405 : Expired Token