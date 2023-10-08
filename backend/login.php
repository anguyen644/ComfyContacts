<?php
include 'util.php';

$request = getRequest();

$username = $request->username;
$password = $request->password;

$connection = new mysqli($mysqliHost, $mysqliUser, $mysqliPassword, $mysqliDatabase, $mysqliPort);
$err = $connection->connect_error;
if ($err) {
    http_response_code(500);
    returnError($err);
    return;
}

$stmt = $connection->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Username = ? AND Password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
if (mysqli_stmt_errno($stmt) != 0) {
    $err = $stmt->error;
	$stmt->close();
	$connection->close();
    http_response_code(400);
    returnError($err);
    return;
}

$result = $stmt->get_result();
$stmt->close();
$connection->close();

if ($row = $result->fetch_assoc()) {
    http_response_code(200);
    returnLogin($row['ID'], $row['FirstName'], $row['LastName']);
} else {
    http_response_code(400);
    returnError("No records found for the username and password combination");
}
