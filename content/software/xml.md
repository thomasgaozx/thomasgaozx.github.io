# XML

A look into XML DTD and XML Schema.
Reference: W3School.

- [XML](#xml)
  - [XML DTD](#xml-dtd)
    - [Internal and External DTD Declaration](#internal-and-external-dtd-declaration)
    - [DTD XML Building Blocks](#dtd-xml-building-blocks)
    - [DTD Declaring Elements](#dtd-declaring-elements)
      - [Empty Elements](#empty-elements)
      - [Elements with PCData](#elements-with-pcdata)
      - [Elements with any Contents](#elements-with-any-contents)
      - [Elements with Children (sequences)](#elements-with-children-sequences)
      - [Declaring Either/Or Content](#declaring-eitheror-content)
      - [Declaring Mixed Content](#declaring-mixed-content)
    - [DTD Declaring Attributes](#dtd-declaring-attributes)
      - [Enumerated Attribute Values](#enumerated-attribute-values)
      - [DTD Entity Declaration](#dtd-entity-declaration)
  - [XML Schema](#xml-schema)
    - [Reference to XML Schema](#reference-to-xml-schema)
    - [`<schema>` Element](#schema-element)
    - [XSD Simple Elements](#xsd-simple-elements)
    - [XSD Attributes](#xsd-attributes)
    - [XSD Complex Elements](#xsd-complex-elements)

## XML DTD

A **Document Type Definition** defines the structure and legal elements and attributes of an XML document.
With a DTD, independent groups of people can agree on a standard DTD for interchanging data.
An application can use a DTD to verify that XML data is valid.

If the DTD is declared inside the XML file, it must be wrapped inside the <!DOCTYPE> definition.
If the DTD is declared in an external file, the <!DOCTYPE> definition must contain a reference to the DTD file, e.g. "note.dtd".

### Internal and External DTD Declaration

If the DTD is declared inside the XML file, it must be wrapped inside the <!DOCTYPE> definition:

```xml
<!DOCTYPE note [
<!ELEMENT note (to,from,heading,body)>
<!ELEMENT heading (#PCDATA)>
<!ELEMENT body (#PCDATA)>
]>
```

If the DTD is declared in an external file, the <!DOCTYPE> definition must contain a reference to the DTD file:

```xml
<!DOCTYPE note SYSTEM "note.dtd">
```

### DTD XML Building Blocks

Seen from a DTD point of view, all XML documents are made up by the following building blocks:

- Elements
- Attributes
- Entities
- PCDATA
- CDATA

Elements (nodes) are the main building blocks of both XML and HTML documents.
Attributes (name/value pairs) provide extra information about elements.

The following entities are predefined in XML:

| Entity References | Character         |
| ----------------- | ----------------- |
| `&nbsp;`          | no breaking space |
| `&lt; &gt;`       | <>                |
| `&amp;`           | &                 |
| `&quot;`          | "                 |
| `&apos;`          | '                 |

**PCDATA** means parsed character data.
Think of character data as the text found between the start tag and the end tag of an XML element.
PCDATA is text that _will_ be parsed by a parser. The text will be examined by the parser for entities and markup.
Tags inside the text will be treated as markup and entities will be expanded.
However, parsed character data should not contain any &, <, or > characters; these need to be represented by the &amp; &lt; and &gt; entities, respectively.

**CDATA** means character data.
CDATA is text that will _not_ be parsed by a parser.
Tags inside the text will _not_ be treated as markup and entities will not be expanded.

### DTD Declaring Elements

In a DTD, XML elements are declared with the following syntax:

```xml
<!ELEMENT element-name category>
or
<!ELEMENT element-name (element-content)>
```

#### Empty Elements

Empty elements are declared with the category keyword EMPTY:

```xml
<!ELEMENT element-name EMPTY>
```

- Example: `<!ELEMENT br EMPTY>`
- XML example: `<br/>`

#### Elements with PCData

Elements with only parsed character data are declared with #PCDATA inside parentheses:

```xml
<!ELEMENT element-name (#PCDATA)>
```

Example: `<!ELEMENT from (#PCDATA)>`

#### Elements with any Contents

Elements declared with the category keyword ANY, can contain any combination of parsable data:

```xml
<!ELEMENT element-name ANY>
```

Example: `<!ELEMENT note ANY>`

#### Elements with Children (sequences)

Elements with one or more children are declared with the name of the children elements inside parentheses:

```xml
<!ELEMENT element-name (child1)>
or
<!ELEMENT element-name (child1,child2,...)>
```

Example: `<!ELEMENT note (to,from,heading,body)>`

When children are declared in a sequence separated by commas, the children must appear in the same sequence in the document. In a full declaration, the children must also be declared, and the children can also have children. Example, the full declaration of the "note" element is:

```xml
<!ELEMENT note (to,from,heading,body)>
<!ELEMENT to (#PCDATA)>
<!ELEMENT from (#PCDATA)>
<!ELEMENT heading (#PCDATA)>
<!ELEMENT body (#PCDATA)>
```

One can declare only one, minimum one, zero or more, zero or one occurrences of an element, respectively:

```xml
<!ELEMENT element-name (child-name)>
<!ELEMENT element-name (child-name+)>
<!ELEMENT element-name (child-name*)>
<!ELEMENT element-name (child-name?)>
```

#### Declaring Either/Or Content

```xml
<!ELEMENT note (to,from,header,(message|body))>
```

#### Declaring Mixed Content

```xml
<!ELEMENT note (#PCDATA|to|from|header|message)*>
```

### DTD Declaring Attributes

In a DTD, attributes are declared with an ATTLIST declaration.
An attribute declaration has the following syntax:

```xml
<!ATTLIST element-name attribute-name attribute-type attribute-value>
```

The **attribute-type** can be one of the following:

| Type           | Description                                   |
| -------------- | --------------------------------------------- |
| `CDATA`        | The value is character data                   |
| `(en1|en2|..)` | The value must be one from an enumerated list |
| `ID`           | The value is a unique id                      |
| `IDREF`        | The value is the id of another element        |
| `IDREFS`       | The value is a list of other ids              |
| `NMTOKEN`      | The value is a valid XML name                 |
| `NMTOKENS`     | The value is a list of valid XML names        |
| `ENTITY`       | The value is an entity                        |
| `ENTITIES`     | The value is a list of entities               |
| `NOTATION`     | The value is a name of a notation             |
| `xml:`         | The value is a predefined xml value           |

The **attribute-value** can be one of the following:

| Value            | Explanation                        |
| ---------------- | ---------------------------------- |
| _value_          | The *default* value of the attribute |
| `#REQUIRED`      | The attribute is required          |
| `#IMPLIED`       | The attribute is optional          |
| `#FIXED` _value_ | The attribute value is fixed       |

#### Enumerated Attribute Values

```xml
<!ATTLIST element-name attribute-name (en1|en2|..) default-value>
<!ATTLIST payment type (check|cash) "cash">
```

#### DTD Entity Declaration

Entities are used to define shortcuts to special characters.
Entities can be declared internal or external.

Internal Entity Declaration:

```xml
<!ENTITY entity-name "entity-value">

<!ENTITY writer "Donald Duck.">
<!ENTITY copyright "Copyright W3Schools.">

<author>&writer;&copyright;</author>
```

External Entity Declaration:

```xml
<!ENTITY entity-name SYSTEM "URI/URL">

<!ENTITY writer SYSTEM "https://www.w3schools.com/entities.dtd">
<!ENTITY copyright SYSTEM "https://www.w3schools.com/entities.dtd">

<author>&writer;&copyright;</author>
```

> Note: An entity has three parts: an ampersand (&), an entity name, and a semicolon (;).

## XML Schema

An XML Schema describes the structure of an XML document.
The XML Schema language is also referred to as **XML Schema Definition (XSD)**.
XML Schema is an XML-based (and more powerful) alternative to DTD.

The purpose of an XML Schema is to define the legal building blocks of an XML document:

- the elements and attributes that can appear in a document
- the number of (and order of) child elements
- data types for elements and attributes
- default and fixed values for elements and attributes

### Reference to XML Schema

```xml
<?xml version="1.0"?>
<note xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.w3schools.com/xml note.xsd">
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>
```

- `xmlns="https://www.w3schools.com"` specifies the default namespace declaration. This declaration tells the schema-validator that all the elements used in this XML document are declared in the "https://www.w3schools.com" namespace.
- `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` makes the XML Schema Instance available.
- `xsi:schemaLocation="https://www.w3schools.com note.xsd"` is the location of the XML schema to use for that namespace.

### `<schema>` Element

The `<schema>` element is the root element of every XML Schema.

```xml
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="https://www.w3schools.com"
xmlns="https://www.w3schools.com"
elementFormDefault="qualified">
...
</xs:schema>
```

- `xmlns:xs="http://www.w3.org/2001/XMLSchema"` indicates that the elements and data types used in the schema come from the "http://www.w3.org/2001/XMLSchema" namespace. It also specifies that the elements and data types that come from the "http://www.w3.org/2001/XMLSchema" namespace should be prefixed with xs.
- `targetNamespace="https://www.w3schools.com"` indicates that the elements defined by this schema (note, to, from, heading, body.) come from the "https://www.w3schools.com" namespace.
- `xmlns="https://www.w3schools.com"` indicates that the default namespace is "https://www.w3schools.com".
- `elementFormDefault="qualified"` indicates that any elements used by the XML instance document which were declared in this schema must be namespace qualified.

### XSD Simple Elements

A simple element is an XML element that can contain only text. It cannot contain any other elements or attributes.
However, the "only text" restriction is quite misleading. The text can be of many different types. It can be one of the types included in the XML Schema definition (boolean, string, date, etc.), or it can be a custom type that you can define yourself.
You can also add restrictions (facets) to a data type in order to limit its content, or you can require the data to match a specific pattern.

```xml
<xs:element name="xxx" type="yyy"/>
```

where xxx is the name of the element and yyy is the data type of the element. XML Schema has a lot of built-in data types. The most common types are:

- xs:string
- xs:decimal
- xs:integer
- xs:boolean
- xs:date
- xs:time

```xml
<xs:element name="lastname" type="xs:string"/>
<xs:element name="age" type="xs:integer"/>
<xs:element name="dateborn" type="xs:date"/>
```

Simple elements may have a default value OR a fixed value specified.
A default value is automatically assigned to the element when no other value is specified.
A fixed value is also automatically assigned to the element, and you cannot specify another value.

```xml
<xs:element name="color" type="xs:string" default="red"/>
<xs:element name="color" type="xs:string" fixed="red"/>
```

### XSD Attributes

Simple elements cannot have attributes. If an element has attributes, it is considered to be of a complex type. But the attribute itself is always declared as a simple type.
The syntax for defining an attribute is:

```xml
<xs:attribute name="xxx" type="yyy"/>

<xs:attribute name="lang" type="xs:string"/>

<lastname lang="EN">Smith</lastname>
```

### XSD Complex Elements

A complex element contains other elements and/or attributes.
A complex element is an XML element that contains other elements and/or attributes.

There are four kinds of complex elements:

- empty elements
- elements that contain only other elements
- elements that contain only text
- elements that contain both other elements and text

> Note: Each of these elements may contain attributes as well!

There are 2 ways to define a complex element in an XML Schema:

The direct way:

```xml
<xs:element name="employee">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="firstname" type="xs:string"/>
      <xs:element name="lastname" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

The indirect way (having a type attribute that refers to the name of the complex type to use). If you use this method, several elements can refer to the same complex type.

```xml
<xs:element name="employee" type="personinfo"/>

<xs:complexType name="personinfo">
  <xs:sequence>
    <xs:element name="firstname" type="xs:string"/>
    <xs:element name="lastname" type="xs:string"/>
  </xs:sequence>
</xs:complexType>
```

You can also base a complex element on an existing complex element and add some elements:

```xml
<xs:complexType name="fullpersoninfo">
  <xs:complexContent>
    <xs:extension base="personinfo">
      <xs:sequence>
        <xs:element name="address" type="xs:string"/>
        <xs:element name="city" type="xs:string"/>
      </xs:sequence>
    </xs:extension>
  </xs:complexContent>
</xs:complexType>
```

A `complexType` element contains nested elements, whereas a `simpleType` element does not contain other elements (surprise suprise).


