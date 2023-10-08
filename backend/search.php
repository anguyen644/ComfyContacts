<?php
include 'util.php';

$request = getRequest();

$userID = $request->userID;
$keyword = "%" . $request->keyword . "%";
$pageIndex = $request->page;
$countsPerPage = $request->countsPerPage;

$connection = new mysqli($mysqliHost, $mysqliUser, $mysqliPassword, $mysqliDatabase, $mysqliPort);
$err = $connection->connect_error;
if ($err) {
    http_response_code(500);
    returnError($err);
    return;
}

$stmt = $connection->prepare("SELECT ID, PhoneNumber, Email, FirstName, LastName, DateCreated FROM Contacts WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ?) ORDER BY LastName, FirstName, ID ASC");
$stmt->bind_param("iss", $userID, $keyword, $keyword);
if ($countsPerPage != null) {
    $stmt = $connection->prepare("SELECT ID, PhoneNumber, Email, FirstName, LastName, DateCreated FROM Contacts WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ?) ORDER BY LastName, FirstName, ID ASC LIMIT ? OFFSET ?");
	$offset = $countsPerPage * $pageIndex;
    $stmt->bind_param("issii", $userID, $keyword, $keyword, $countsPerPage, $offset);
}
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
if ($result) {
    $arr = $result->fetch_all(MYSQLI_ASSOC);
    returnResult($arr);
} else {
    returnEmpty();
}
