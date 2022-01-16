const fs = require("fs");
const xml2js = require("xml2js");
const express = require("express");
const cors = require("cors");
var FormData = require("form-data");
var request = require("request");
var axios = require("axios");

var tough = require("tough-cookie");
var Cookie = tough.Cookie;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.post("/generate_invoice", async (req, res) => {
  console.log(req.body);

  fs.readFile("agent.xml", "utf-8", (err, data) => {
    if (err) {
      throw err;
    }

    xml2js.parseString(data, (err, result) => {
      if (err) {
        throw err;
      }

      console.log(req.body.address);
      console.log(result.xmlszamla.vevo[0].nev);
      result.xmlszamla.vevo[0].nev = req.body.name;
      result.xmlszamla.vevo[0].irsz = req.body.zipCode;
      result.xmlszamla.vevo[0].telepules = req.body.city;
      result.xmlszamla.vevo[0].cim = req.body.address;
      result.xmlszamla.vevo[0].email = req.body.email;

      result.xmlszamla.tetelek[0].tetel[0].nettoErtek = req.body.price;
      result.xmlszamla.tetelek[0].tetel[0].bruttoErtek = parseInt(
        req.body.price
      );

      console.log(req.body.hours);
      result.xmlszamla.tetelek[0].tetel[0].mennyiseg = req.body.hours;

      result.xmlszamla.tetelek[0].tetel[0].nettoEgysegar = req.body.slotPrice;

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      fs.writeFile("agent.xml", xml, async (err) => {
        if (err) {
          throw err;
        }
        console.log(`Updated XML is written to a new file.`);
        var util = require("util");
        var exec = require("child_process").exec;

        var command =
          "curl -v -F action-xmlagentxmlfile=@agent.xml -c ./cookies.txt -o response.pdf https://www.szamlazz.hu/szamla/";

        child = exec(command, function (error, stdout, stderr) {
          console.log("stdout: " + stdout);
          console.log("stderr: " + stderr);

          if (error !== null) {
            console.log("exec error: " + error);
            res.status(500).json({ msg: "Error Occured!" });
          }
        });
        res.send("done");
      });
    });
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
app.listen(port, function () {
  console.log("Server started!");
});
