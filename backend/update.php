<?php
include 'util.php';

$request = getRequest();

$userID = $request->userID;
$id = $request->id;
$phoneNumber = $request->phoneNumber;
$email = $request->email;
$firstName = $request->firstName;
$lastName = $request->lastName;

$connection = new mysqli($mysqliHost, $mysqliUser, $mysqliPassword, $mysqliDatabase, $mysqliPort);
$err = $connection->connect_error;
if ($err) {
    http_response_code(500);
    returnError($err);
    return;
}

$stmt = $connection->prepare("UPDATE Contacts SET PhoneNumber = ?, Email = ?, FirstName = ?, LastName = ? WHERE UserID = ? AND ID = ?");
$stmt->bind_param("ssssii", $phoneNumber, $email, $firstName, $lastName, $userID, $id);
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
