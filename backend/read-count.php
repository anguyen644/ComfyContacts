<?php
include 'util.php';

$request = getRequest();

$userID = $request->userID;

$connection = new mysqli($mysqliHost, $mysqliUser, $mysqliPassword, $mysqliDatabase, $mysqliPort);
$err = $connection->connect_error;
if ($err) {
    http_response_code(500);
    returnError($err);
    return;
}

$stmt = $connection->prepare("SELECT COUNT(*) FROM Contacts WHERE UserID = ?");
$stmt->bind_param("i", $userID);
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

http_response_code(200);
if ($row = $result->fetch_assoc()) {
    returnCount($row["COUNT(*)"]);
} else {
    returnCount(0);
}
