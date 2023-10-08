<?php
// TODO:: Must configure database credentials before setting up the website (it is based upon how you configure the database)
// For privacy reasons this is taken out.
$mysqliHost = "";
$mysqliUser = "";
$mysqliPassword = "";
$mysqliDatabase = "";
$mysqliPort = 0;

function getRequest()
{
    return json_decode(file_get_contents('php://input'));
}

function sendResponse($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnError(string $err)
{
    class ErrorMsg
    {
        public string $error;
    }
    $error = new ErrorMsg();
    $error->error = $err;
    $value = json_encode($error);
    if ($value == false) {
        returnEmpty();
    } else {
        sendResponse($value);
    }
}

function returnEmpty()
{
    class EmptyResult{}
    returnResult(new EmptyResult());
}

function returnResult($results)
{
    class Result
    {
        public $result;
    }
    $result = new Result();
    $result->result = $results;
    $value = json_encode($result);
    if ($value == false) {
        returnEmpty();
    } else {
        sendResponse($value);
    }
}

function returnLogin(int $id, string $firstName, string $lastName)
{
    class Login
    {
        public int $id;
        public string $firstName;
        public string $lastName;
    }
    $login = new Login();
    $login->id = $id;
    $login->firstName = $firstName;
    $login->lastName = $lastName;
    returnResult($login);
}

function returnCount($count)
{
    class Count
    {
        public $count;
    }
    $countObj = new Count();
    $countObj->count = $count;
    returnResult($countObj);
}
