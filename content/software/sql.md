# SQL Primer

Reference: [w3schools](www.w3schools.com/sql)

- [SQL Primer](#sql-primer)
  - [Preliminaries](#preliminaries)
    - [Create and Drop Table](#create-and-drop-table)
    - [`SELECT`](#select)
    - [Aliases](#aliases)
  - [`WHERE` and Conditions](#where-and-conditions)
    - [Conditional Operators](#conditional-operators)
    - [`AND, OR, NOT`](#and-or-not)
    - [`EXIST` Operator](#exist-operator)
    - [`ANY, All` Operators](#any-all-operators)
  - [Modifying Table](#modifying-table)
    - [`INSERT INTO`](#insert-into)
    - [`UPDATE`](#update)
    - [`DELETE`](#delete)
    - [Joins](#joins)
    - [`SELECT INTO`](#select-into)
    - [`INSERT INTO SELECT`](#insert-into-select)
  - [`ORDER BY`](#order-by)
  - [`GROUP BY`](#group-by)
    - [`Min, Max`](#min-max)
    - [`COUNT, AVG, SUM`](#count-avg-sum)
    - [`HAVING` Clause](#having-clause)
  - [Additional Techniques](#additional-techniques)
    - [`UNION`](#union)
    - [Self Join*](#self-join)
    - [`CASE`](#case)
    - [Stored Procedures](#stored-procedures)

## Preliminaries

### Create and Drop Table

```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
   ....
);

-- create table from another table
CREATE TABLE new_table_name AS
    SELECT column1, column2,...
    FROM existing_table_name
    WHERE ....;
```

Examples:

```sql
CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
);
```

To Drop Table:

```sql
DROP TABLE table_name;
TRUNCATE TABLE table_name; -- delete all data but not the table
```

### `SELECT`

The `SELECT` statement is used to select data from a database.
The data returned is stored ina  result table, called the result-set.
`SELECT DISTINCT` statement is used to return only distinct values.

```sql
SELECT column_name(s) FROM table_name;
SELECT * FROM table_name;
SELECT DISTINCT column_name(s) from table_name;
```

### Aliases

SQL aliases are used to give a table, or a column in a table, a temporary name.
Aliases are often used to make column names more readable.
An alias _only_ exists for the duration of the query.

```sql
SELECT column_name AS alias_name FROM table_name; -- Alias Column
SELECT column_name(s) FROM table_name AS alias_name; -- Alias Table

SELECT CustomerID AS ID, CustomerName AS Customer FROM Customers;

SELECT o.OrderID, o.OrderDate, c.CustomerName
FROM Customers AS c, Orders AS o
WHERE c.CustomerName="Around the Horn" AND c.CustomerID=o.CustomerID;
```

> **Note**: it requires double quotation marks or square brackess if the alias name contains spaces.

One can also create combined columns with alias:

```sql
SELECT CustomerName, CONCAT(Address,', ',City,', ',Country) AS Address
FROM Customers;
```

## `WHERE` and Conditions

```sql
SELECT column_name(s) FROM table_name WHERE condition;
SELECT * FROM Customers WHERE Country='Canada';
SELECT * FROM Product WHERE Price BETWEEN 50 AND 60;
SELECT * FROM Customers WHERE City IN ('Paris','London');
```

### Conditional Operators

`=, >, <, >=, <=` are self explanatory. `<>` is _not_ equal. Other operators include:

| Opeartor  | Description              |
| --------- | ------------------------ |
| `BETWEEN` | Between a certain range  |
| `LIKE`    | Search for a pattern     |
| `IN`      | In a given set of values |

```sql
SELECT column_name(s) FROM table_name
WHERE column_name IN (value1, value2, ...);
SELECT column_name(s) FROM table_name
WHERE column_name IN (SELECT STATEMENT);

SELECT column_name(s) FROM table_name
WHERE column_name BETWEEN value1 AND value2;
SELECT * FROM Products WHERE Price NOT BETWEEN 10 AND 20;
```

### `AND, OR, NOT`

```sql
SELECT column_name(s) FROM table_name WHERE condition1 AND condition2;
SELECT column_name(s) FROM table_name WHERE condition1 OR condition2;
SELECT column_name(s) FROM table_name WHERE NOT condition;
SELECT * FROM Customers WHERE NOT Country='Germany' AND NOT Country='USA';
```

### `EXIST` Operator

The `EXISTS` operator is used to test for the existence of any record in a subquery.
The `EXISTS` operator returns true if the subquery returns one or more records.

```sql
SELECT column_name(s) FROM table_name
WHERE EXISTS
(SELECT column_name FROM table_name WHERE condition);

SELECT SupplierName FROM Suppliers WHERE EXISTS
(SELECT ProductName FROM Products WHERE Products.SupplierID = Suppliers.supplierID AND Price < 20);

SELECT SupplierName FROM Suppliers
WHERE EXISTS (SELECT ProductName FROM Products WHERE Products.SupplierID = Suppliers.supplierID AND Price = 22);
```

### `ANY, All` Operators

The `ANY` and `ALL` operators are used with a `WHERE` or `HAVING` clause.
The `ANY` operator returns true if any of the subquery values meet the condition.
The `ALL` operator returns true if all of the subquery values meet the condition.

```sql
SELECT column_name(s) FROM table_name
WHERE column_name ANY
(SELECT column_name FROM table_name WHERE condition);

SELECT column_name(s) FROM table_name
WHERE column_name ALL
(SELECT column_name FROM table_name WHERE condition);
```

Examples:

```sql
SELECT ProductName FROM Products
WHERE ProductID = ANY (SELECT ProductID FROM OrderDetails WHERE Quantity = 10);

SELECT ProductName FROM Products
WHERE ProductID = ANY (SELECT ProductID FROM OrderDetails WHERE Quantity > 99);

SELECT ProductName FROM Products
WHERE ProductID = ALL (SELECT ProductID FROM OrderDetails WHERE Quantity = 10);
```


## Modifying Table

### `INSERT INTO`

The `INSERT INTO` statement is used to insert new records in a table.
It is possible to write the `INSERT INTO` statement in two ways.
The first way specifies both the column names and the values to be inserted:
If you are adding values for all the columns of the table, you do _not_ need to specify the column names in the SQL query. However, make sure the order of the values is in the same order as the columns in the table. The INSERT INTO syntax would be as follows:

```sql
INSERT INTO table_name (column1, column2) VALUES (value1, value2);
INSERT INTO table_name VALUES (value1, value2, value3, ...);

INSERT INTO Customers (CustomerName, City, Country)
VALUES ('Cardinal', 'Stavanger', 'Norway');
```

### `UPDATE`

The UPDATE statement is used to modify the existing records in a table.

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;

UPDATE Customers SET ContactName='Juan' WHERE Country='Mexico';
```

> **WARNING**: Be careful when updating records. If you omit the WHERE clause, ALL records will be updated!

### `DELETE`

```sql
DELETE FROM table_name WHERE condition;
DELETE FROM Customers WHERE CustomerName='Alfreds Futterkiste';
DELETE FROM table_name; --WARNING: delete all rows
```

### Joins

Here are the different types of the Joins in SQL:

- `INNER JOIN`: Returns records that have matching values in both tables
- `LEFT JOIN`: Return all records from the left table, and the matched records from the right table
- `RIGHT JOIN`: Return all records from the right table, and the matched records from the left table
- `FULL OUTER JOIN`: Return all records when there is a match in either left or right table

```sql
SELECT column_name(s) FROM table1 INNER JOIN table2
ON table1.column_name = table2.column_name;

SELECT column_name(s) FROM table1 LEFT JOIN table2
ON table1.column_name = table2.column_name;

SELECT column_name(s) FROM table1 FULL OUTER JOIN table2
ON table1.column_name = table2.column_name WHERE condition;

SELECT Orders.OrderID, Customers.CustomerName FROM Orders
INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID;

SELECT Customers.CustomerName, Orders.OrderID FROM Customers
LEFT JOIN Orders ON Customers.CustomerID = Orders.CustomerID
ORDER BY Customers.CustomerName;

SELECT Customers.CustomerName, Orders.OrderID FROM Customers
FULL OUTER JOIN Orders ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

### `SELECT INTO`

The SQL `SELECT INTO` Statement
The `SELECT INTO` statement copies data from one table into a new table.

Copy all columns into a new table:

```sql
SELECT * INTO newtable [IN externaldb]
FROM oldtable WHERE condition;
```

Copy only some columns into a new table:

```sql
SELECT column1, column2 INTO newtable [IN externaldb]
FROM oldtable WHERE condition;
```

Examples:

```sql
-- creates a backup copy of Customer
SELECT * INTO CustomersBackup2017 IN 'Backup.mdb' FROM Customers;

SELECT * INTO CustomersGermany FROM Customers WHERE Country = 'Germany';
```

### `INSERT INTO SELECT`

The `INSERT INTO SELECT` statement copies data from one table and inserts it into another table.

- `INSERT INTO SELECT` requires that data types in source and target tables match
- The existing records in the target table are unaffected

```sql
INSERT INTO table2
SELECT * FROM table1
WHERE condition;

INSERT INTO table2 (column1, column2)
SELECT column1, column2
FROM table1
WHERE condition;
```

Examples:

```sql
INSERT INTO Customers (CustomerName, City, Country)
SELECT SupplierName, City, Country FROM Suppliers;
```

## `ORDER BY`

`ORDER BY` keyword is used to sort the result set in ascending or descending order.
It sorts the records in ascending order by default.
To sort the records in descending order, use the DESC keyword.

```sql
SELECT column_name(s) FROM table_name ORDER BY column_name(s) ASC|DESC
SELECT * FROM Customers ORDER BY Country;
SELECT * FROM Customers ORDER BY Country ASC, CustomerName DESC;
```

## `GROUP BY`

> `SELECT` returns _one_ result set, `GROUP BY` seems to return multiple result sets. One could think of these multiple result sets as rows of one table, and each result set has attribute/columns like `COUNT(column_name)`

The `GROUP BY` statement is often used with aggregate functions (`COUNT, MAX, MIN, SUM, AVG`) to group the result-set by one or more columns.

```sql
SELECT column_name(s)
FROM table_name
WHERE condition
GROUP BY column_name(s)
ORDER BY column_name(s);
```

### `Min, Max`

The `MIN()` function returns the smallest value of the selected column.
The `MAX()` function returns the largest value of the selected column.

```sql
SELECT MIN(column_name) FROM table_name WHERE condition;
SELECT MAX(column_name) FROM table_name WHERE condition;
```

### `COUNT, AVG, SUM`

The `COUNT()` function returns the number of rows that matches a specified criteria.
The `AVG()` function returns the average value of a numeric column.
The `SUM()` function returns the total sum of a numeric column.

```sql
SELECT COUNT(column_name) FROM table_name WHERE condition;
SELECT AVG(column_name) FROM table_name WHERE condition;
SELECT SUM(column_name) FROM table_name WHERE condition;

SELECT COUNT(ProductID) FROM Products;
SELECT AVG(Price) FROM Products;
SELECT SUM(Quantity) FROM OrderDetails;

SELECT COUNT(CustomerID), Country FROM Customers GROUP BY Country;
SELECT COUNT(CustomerID), Country FROM Customers GROUP BY Country
ORDER BY COUNT(CustomerID) DESC;
```

### `HAVING` Clause

The `HAVING` clause was added to SQL because the `WHERE` keyword could not be used with aggregate functions.

```sql
SELECT column_name(s)
FROM table_name
WHERE condition
GROUP BY column_name(s)
HAVING condition
ORDER BY column_name(s);

SELECT COUNT(CustomerID), Country
FROM Customers
GROUP BY Country
HAVING COUNT(CustomerID) > 5; --only include countries with >5 customers

SELECT Employees.LastName, COUNT(Orders.OrderID) AS NumberOfOrders
FROM (Orders
INNER JOIN Employees ON Orders.EmployeeID = Employees.EmployeeID)
GROUP BY LastName
HAVING COUNT(Orders.OrderID) > 10;
```

## Additional Techniques

### `UNION`

The `UNION` operator is used to combine the result-set of two or more `SELECT` statements.

- Each `SELECT` statement within UNION must have the same number of columns
- The columns must also have similar data types
- The columns in each `SELECT` statement must also be in the same order

```sql
SELECT column_name(s) FROM table1
UNION
SELECT column_name(s) FROM table2;
```

The `UNION` operator selects only distinct values by default. To allow duplicate values, use `UNION ALL`:

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

Examples:

```sql
SELECT City FROM Customers UNION SELECT City FROM Suppliers ORDER BY City;
SELECT City FROM Customers UNION ALL SELECT City FROM Suppliers ORDER BY City;

SELECT 'Customer' As Type, ContactName, City, Country
FROM Customers
UNION
SELECT 'Supplier', ContactName, City, Country
FROM Suppliers;
```

Notice the "AS Type" above - it is an alias. SQL Aliases are used to give a table or a column a temporary name.
An alias only exists for the duration of the query.
So, here we have created a temporary column named "Type", that list whether the contact person is a "Customer" or a "Supplier".

![alias-result](https://i.imgur.com/cusxDW8.png)

### Self Join*

A self JOIN is a regular join, but the table is joined with itself.

```sql
SELECT column_name(s) FROM table1 T1, table1 T2 WHERE condition;
```

`T1` and `T2` are different table aliases for the same table.

The following SQL statement matches customers that are from the same city:

```sql
SELECT A.CustomerName AS CustomerName1,
B.CustomerName AS CustomerName2, A.City
FROM Customers A, Customers B WHERE A.CustomerID <> B.CustomerID
AND A.City = B.City ORDER BY A.City;
```

### `CASE`

The `CASE` statement goes through conditions and returns a value when the first condition is met (like an IF-THEN-ELSE statement). So, once a condition is true, it will stop reading and return the result. If no conditions are true, it returns the value in the ELSE clause.
If there is no ELSE part and no conditions are true, it returns NULL.

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    WHEN conditionN THEN resultN
    ELSE result
END;
```

Examples:

```sql
SELECT OrderID, Quantity,
CASE
    WHEN Quantity > 30 THEN "The quantity is greater than 30"
    WHEN Quantity = 30 THEN "The quantity is 30"
    ELSE "The quantity is under 30"
END AS QuantityText
FROM OrderDetails;

SELECT CustomerName, City, Country
FROM Customers
ORDER BY
(CASE
    WHEN City IS NULL THEN Country
    ELSE City
END);
```

### Stored Procedures

A stored procedure is a prepared SQL code that you can save, so the code can be reused over and over again.
So if you have an SQL query that you write over and over again, save it as a stored procedure, and then just call it to execute it.
You can also pass parameters to a stored procedure, so that the stored procedure can act based on the parameter value(s) that is passed.

```sql
-- to store procedure
CREATE PROCEDURE procedure_name
AS
sql_statement
GO;

-- to execute stored procedure
EXEC procedure_name;

-- to store procedure with parameter
CREATE PROCEDURE SelectAllCustomers @City nvarchar(30)
AS
SELECT * FROM Customers WHERE City = @City
GO;

-- to execute procedure with parameter
EXEC SelectAllCustomers City = "London";
```
