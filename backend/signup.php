<?php
include 'util.php';

$request = getRequest();

$username = $request->username;
$password = $request->password;
$firstName = $request->firstname;
$lastName = $request->lastname;

$connection = new mysqli($mysqliHost, $mysqliUser, $mysqliPassword, $mysqliDatabase, $mysqliPort);
$err = $connection->connect_error;
if ($err) {
    http_response_code(500);
    returnError($err);
    return;
}

$stmt = $connection->prepare("INSERT into Users (FirstName,LastName,Username,Password) VALUES(?,?,?,?)");
$stmt->bind_param("ssss", $firstName, $lastName, $username, $password);
$stmt->execute();
if (mysqli_stmt_errno($stmt) != 0) {
    $err = $stmt->error;
	$stmt->close();
	$connection->close();
    http_response_code(400);
    returnError($err);
    return;
}

$stmt->close();
$connection->close();
http_response_code(200);
returnEmpty();
