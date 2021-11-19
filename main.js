
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var session = require('express-session');
var flash = require('connect-flash');
var xlsx = require('xlsx');
var mime = require('mime');
var exceljs = require('exceljs');

var dateTime = require('node-datetime');
var dt = dateTime.create();
var datetimeF = dt.format('Y-m-d H:M:S');
var dateF = dt.format('Ymd');

db_config = {
	host: "tpe.c5h4fcntitgg.ap-southeast-1.rds.amazonaws.com",
  user: "admin",
  password: "adminadmin",
  database: "tpewms",
  port: 3306
}

var con = mysql.createConnection({db_config});

//con.connect(function(err) {
//	if (err) throw err;
//	console.log("Connected!");
  //});
 
  function handleDisconnect() {
	con = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.
  
	con.connect(function(err) {              // The server is either down
	  if(err) {                                     // or restarting (takes a while sometimes).
		console.log('error when connecting to db:', err);
		setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
	  }                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
											// If you're also serving http, display a 503 error.
	con.on('error', function(err) {
	  console.log('db error', err);
	  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
		handleDisconnect();                         // lost due to either server restart, or a
	  } else {                                      // connnection idle timeout (the wait_timeout
		throw err;                                  // server variable configures this)
	  }
	});
  }
  
  handleDisconnect();






var app = express();
app.set('view engine', 'ejs'); 
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"css")));
app.use(express.static(path.join(__dirname,"client")));
app.use(express.json());
app.use(flash());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



app.get('/', function(request, response) {
	//response.sendFile(path.join(__dirname + '/index.html'));
	response.render(path.join(__dirname + '/client/index.html'));
});
app.get('/homepage', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/homepage.ejs'), {
		userid: request.session.userid,
		job: request.session.job
	});
	
});



app.get('/addinfo', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/addpage.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		userid: request.session.userid,
		job: request.session.job
	});
});
app.get('/updateinfo', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/updatepage.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		results: request.flash('results'),
		userid: request.session.userid,
		job: request.session.job
	});
});

app.get('/searchinfo', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/searchpage.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		results: request.flash('results'),
		userid: request.session.userid,
		job: request.session.job
	});
});

app.get('/deleteinfo', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/deletepage.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		results: request.flash('results'),
		userid: request.session.userid,
		job: request.session.job
	});
});

app.get('/mdseadd', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/mdseadd.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		userid: request.session.userid,
		job: request.session.job
	});
});

app.get('/mdseout', function(request, response) {
	
	//response.sendFile(path.join(__dirname + '/client/homepage.html'));
	response.render(path.join(__dirname + '/client/mdseout.ejs'), {
		error: request.flash('error'),
		message : request.flash('message'),
		results: request.flash('results'),
		userid: request.session.userid,
		job: request.session.job
	});
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		con.query('SELECT * FROM users WHERE userid = ? AND password = ?', [username, password], function(error, results, fields) {	
		if (error) throw error;
			if (results.length > 0) {
				
				//response.redirect('/home');
				var userid = results[0].userid;
				var job = results[0].job;
				
				request.session.userid = username;
				request.session.job = job ;

				response.redirect('homepage');

			//	response.render(path.join(__dirname + '/client/homepage.ejs'), {
			//		userid: results[0].userid,
			//		job: results[0].job
			//	});

			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post('/insertItem', function(request, response) {
	var itemid = request.body.itemID;
	var selectCategory = request.body.category;
	var selectLocation = request.body.location;
	var remark = request.body.remarks;
	var brand = request.body.brand;
	var description = request.body.description;
	
		con.query("INSERT INTO iteminfo VALUES (?,?,?,?,?,?,?,?);", [itemid, selectCategory,remark,request.session.userid,datetimeF,selectLocation,brand,description], function(error, results, fields) {	
		if (error) {
		
		request.flash('error', 'Something Wrong');
		response.redirect('addinfo');
		//throw error;
		}
		else{

			if (results.affectedRows > 0) {
				request.flash('message', 'Saved Successfully');
				response.redirect('addinfo');			
			} else {
				request.flash('error', 'Something Wrong');
				response.redirect('addinfo');
			}			

		}

			response.end();
		});

});

app.post('/searchItem', function(request, response) {
	var itemid = request.body.itemID;
	var selectCategory = request.body.category;
	var selectLocation = request.body.location;
	var brand = request.body.brand;
	
	

	if (itemid == "all"){
		con.query('SELECT * FROM iteminfo ORDER BY location;', function(error, results, fields) {	
			if (error) throw error;
			
				if (results.length > 0) {
					
					
				//	var userid = results[0].userid;
				//	var job = results[0].job;
					
					
					request.session.resultspass = results;
					request.flash('results', results);
					response.redirect('searchinfo');
	
				//	response.render(path.join(__dirname + '/client/searchpage.ejs'), {
				//		results: results,
				//		userid: request.session.userid,
				//		job: request.session.job
				//	});
	
				}
				else{
						response.redirect('searchinfo');
					}
							
				
				response.end();
			});
	}
else{

		con.query('SELECT * FROM iteminfo WHERE itemid = ? or category = ? or location =? or brand =?', [itemid, selectCategory,selectLocation,brand], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.length > 0) {
				
				
			//	var userid = results[0].userid;
			//	var job = results[0].job;
				
				
				request.session.resultspass = results;
				request.flash('results', results);
				response.redirect('searchinfo');

			//	response.render(path.join(__dirname + '/client/searchpage.ejs'), {
			//		results: results,
			//		userid: request.session.userid,
			//		job: request.session.job
			//	});

			}
			else{
					response.redirect('searchinfo');
				}
						
			
			response.end();
		});
	}
});


app.post('/passtoUpdate', function(request, response) {
	var itemid = request.body.itemid;
	
	
	
	con.query('SELECT * FROM iteminfo WHERE itemid = ?', [itemid], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.length > 0) {
				
				
				request.flash('results', results);
				response.redirect('updateinfo');

			

			}
			else{
					response.redirect('updateinfo');
				}
						
			
			response.end();
		});

});


app.post('/updateItem', function(request, response) {
	var itemid = request.body.itemID;
	var selectCategory = request.body.category;
	var selectLocation = request.body.location;
	var remark = request.body.remarks;
	var user = request.session.userid;
	var brand = request.body.brand;
	var description = request.body.description;
	

	con.query('update iteminfo set category=?, remark=?, userid=?, datetime=?, location=?, brand=?, description=? where itemid=?', [selectCategory, remark, user, datetimeF, selectLocation, brand, description, itemid], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.affectedRows > 0) {
				
				
				request.flash('message', "Save Successfully");
				response.redirect('searchinfo');

			

			}
			else {
				request.flash('error', 'Something Wrong');
				response.redirect('searchinfo');
			}		
						
			
			response.end();
		});

});

app.post('/passtoDelete', function(request, response) {
	var itemid = request.body.itemid;
	
	
	con.query('SELECT * FROM iteminfo WHERE itemid = ?', [itemid], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.length > 0) {
				
				
				request.flash('results', results);
				response.redirect('deleteinfo');

			

			}
			else{
					response.redirect('deleteinfo');
				}
						
			
			response.end();
		});

});

app.post('/deleteItem', function(request, response) {
	var itemid = request.body.itemID;
	
	
	con.query('delete from iteminfo where itemid=?', [itemid], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.affectedRows > 0) {
				
				
				request.flash('message', "Save Successfully");
				response.redirect('searchinfo');

			

			}
			else {
				request.flash('error', 'Something Wrong');
				response.redirect('searchinfo');
			}		
						
			
			response.end();
		});

});
app.post('/insertMDSE', function(request, response) {
	var itemid = request.body.itemID;
	var batch = request.body.batch;
	var quantity = request.body.qty;
	var remark = request.body.remarks;
	var brand = request.body.brand;
	var location = request.body.location;

		con.query("INSERT INTO merchandisein VALUES (?,?,?,?,?,?,?,?);", [itemid, batch,quantity,location,brand,remark,datetimeF,request.session.userid], function(error, results, fields) {	
		if (error) {
		
		request.flash('error', 'Something Wrong');
		response.redirect('mdseadd');
		console.log("before");
		//throw error;
		}
		else{

			if (results.affectedRows > 0) {
				request.flash('message', 'Saved Successfully');
				response.redirect('mdseadd');			
			} else {
				request.flash('error', 'Something Wrong');
				response.redirect('mdseadd');
				console.log("before");
			}			

		}

			response.end();
		});

});

app.post('/searchMDSE', function(request, response) {
	var batch = request.body.batch;
	

		con.query("SELECT * FROM merchandisein where batch=?;", [batch], function(error, results, fields) {	
			if (error) throw error;
		
			if (results.length > 0) {
				
				request.flash('results', results);
				response.redirect('mdseout');

			

			}
			else{
					response.redirect('mdseout');
				}

			response.end();
		});

});

app.post('/updateMDSE', function(request, response) {
	var item = request.body.item;
	var batch = request.body.batch;
	var quantity = request.body.qty;
	var quantityremain = request.body.qtyremain;
	var quantityF = quantityremain - quantity;

	if (quantityF == "0"){
		con.query('insert into merchandiseout VALUES (?,?,?,?,?);', [item, batch, quantity, datetimeF, request.session.userid], function(error, results, fields) {	
			if (error) throw error;
			
			if (results.affectedRows > 0) {
				con.query('delete from merchandisein where batch=?;', [batch], function(error, results, fields) {	
					if (error) throw error;
					if (results.affectedRows > 0) {
				
				
						request.flash('message', "Save Successfully");
						response.redirect('mdseout');
		
					
		
					}
					else {
						request.flash('error', 'Something Wrong');
						response.redirect('mdseout');
					}		

				});
				
			}
			else {
				request.flash('error', 'Something Wrong');
				response.redirect('mdseout');
			}				
				
			//	response.end();
			});

	}


else{
	con.query('update merchandisein set quantity=? where batch=?', [quantityF, batch], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.affectedRows > 0) {
				con.query('insert into merchandiseout VALUES (?,?,?,?,?);', [item, batch, quantity, datetimeF, request.session.userid], function(error, results, fields) {	
					if (error) throw error;
					if (results.affectedRows > 0) {
				
				
						request.flash('message', "Save Successfully");
						response.redirect('mdseout');
		
					
		
					}
					else {
						request.flash('error', 'Something Wrong');
						response.redirect('mdseout');
					}		

				});

			}
			else {
				request.flash('error', 'Something Wrong');
				response.redirect('mdseout');
			}		
						
			
			//response.end();
		});

	}

});


/*
app.post('/printexcel', function(request, response) {

	var results = request.session.resultspass;
	
		con.query('SELECT * FROM iteminfo WHERE itemid = ? or category = ?', [itemid, selectCategory], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.length > 0) {
				
				
				
				
			
				const wb = new exceljs.Workbook();
				const ws = wb.addWorksheet("Warehouse List");

				const imageId = wb.addImage({
					filename: 'tokimekuimg.png',
					extension: 'png',
				  });
			    ws.addImage(imageId, 'A1:D5');

				ws.mergeCells('A7:C7');
				ws.getCell('A7').value = "INVENTORY LIST  -  TOKIMEKU PRECISION ENGINEERING";
				ws.getCell('A7').font ={bold:true, size:16, underline:true};

				ws.getRow(9).values = ['Item', 'Description', 'Barcode', 'Remarks'];
				ws.getRow(9).font = { bold: true,size:15 };
				
				var borderStyles = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" }
				  };

				ws.getRow(9).eachCell({ includeEmpty: false }, function(row, rowNumber) {
					row.border = borderStyles;
					row.fill = {
						type: 'pattern',
						pattern:'solid',
						fgColor:{argb:'F08080'},
					  };
					  
				  });

				

				ws.columns = [
					{ key: 'Item',width:10,border:true},
					{ key: 'Description',width:30},
					{ key: 'Barcode', width:30},
					{ key: 'Remarks',width:30}
					];

				var k=10;
				for(var i = 1; i<=results.length; i++){
					
					
					ws.addRow({Item: i, Description: results[i-1].itemid, Remarks: results[i-1].remark});				
					ws.getRow(k).eachCell({ includeEmpty: false }, function(row, rowNumber) {
						row.border = borderStyles;
											  
					  });
					  k++;

				}
			
				ws.getCell("A"+ (k+15)).value = "SYSTEM GENERATED";
				ws.getCell("A"+ (k+15)).font ={bold:true, size:16};


				// response headers
				response.set({
				  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				  'Content-Disposition': `attachment; filename="newdatatest.xlsx"`,
				});
				
				// write into response
				wb.xlsx.write(response);


				

				const file = __dirname +"/newdatatest.xlsx";
				const filename = path.basename(file);
				const mimeType = mime.getType(file);
				//const mimeType = "application/vnd.ms-excel";
				console.log(filename);
				console.log(mimeType);
				
				response.setHeader("Content-Type", mimeType);
				response.setHeader("Content-Disposition", "attachment; filename=" + filename);
				response.download(file);

				//response.redirect('downloadinfo');

			
			}
			else{
					response.redirect('searchinfo');
					
				}
						
			//response.end();
			
		});

});

*/

app.post('/printexcel', function(request, response) {

	var results = request.session.resultspass;

				//console.log(results);
				const wb = new exceljs.Workbook();
				const ws = wb.addWorksheet("Warehouse List");

				const imageId = wb.addImage({
					filename: 'tokimekuimg.png',
					extension: 'png',
				  });
			    ws.addImage(imageId, 'A1:D5');

				ws.mergeCells('A7:C7');
				ws.getCell('A7').value = "INVENTORY LIST  -  TOKIMEKU PRECISION ENGINEERING";
				ws.getCell('A7').font ={bold:true, size:16, underline:true};

				ws.getRow(9).values = ['No', 'ItemID', 'Category', 'Description','Location','Brand', 'Remarks'];
				ws.getRow(9).font = { bold: true,size:15 };
				
				var borderStyles = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" }
				  };

				ws.getRow(9).eachCell({ includeEmpty: false }, function(row, rowNumber) {
					row.border = borderStyles;
					row.fill = {
						type: 'pattern',
						pattern:'solid',
						fgColor:{argb:'F08080'},
					  };
					  
				  });

				

				ws.columns = [
					{ key: 'No',width:10,border:true},
					{ key: 'ItemID',width:30},
					{ key: 'Category', width:30},
					{ key: 'Description',width:35},
					{ key: 'Location', width:30},
					{ key: 'Brand', width:30},
					{ key: 'Remarks', width:35}
					];

				var k=10;
				for(var i = 1; i<=results.length; i++){
					
					
					ws.addRow({No: i, ItemID: results[i-1].itemid, Category: results[i-1].category, Description: results[i-1].description, Location: results[i-1].location, Brand: results[i-1].brand, Remarks: results[i-1].remark});				
					ws.getRow(k).eachCell({ includeEmpty: false }, function(row, rowNumber) {
						row.border = borderStyles;
											  
					  });
					  k++;

				}
			
				ws.getCell("A"+ (k+5)).value = "SYSTEM GENERATED";
				ws.getCell("A"+ (k+5)).font ={bold:true, size:16};


				// response headers
				response.set({
				  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				  'Content-Disposition': "attachment; filename=InventoryList_" +dateF + ".xlsx" ,
				});
				
				// write into response
				wb.xlsx.write(response);
				delete request.session.resultspass;
				

			
		});







/*
function createExcel(results){
	var count = 1;

	var wb = xlsx.readFile("List_Inventory.xlsx",{cellStyles:true});
	var ws = wb.Sheets["list"];
	//var data = xlsx.utils.sheet_to_json(ws,{		
	//	range:"A7:G13"
	//});

	var data = xlsx.utils.sheet_to_json(ws,{
		range:"A7:G40"
	});
	console.log(data);

	var newdata = data.map(function(record){
		record.Item = count++;
		//record.Description = itemid;
		//record.Category = selectCategory;
		//record.Remarks = remark;
		record.Barcode = results[0].remark;
		return record;
		 
	});
	console.log(newdata);

	var newWB = xlsx.utils.book_new();
	var newWS = xlsx.utils.json_to_sheet(newdata,{
		range:"A7:G40"
	});
	xlsx.utils.book_append_sheet(newWB,newWS,"newsheetdate");
	xlsx.writeFile(newWB, "newdatatest.xlsx");
}


function createExcel(results){
	
	const wb = new exceljs.Workbook();
	//const wb = createAndFillWorkbook();

	

	const ws = wb.addWorksheet('list');
	ws.getCell('A2').fill = {
		type: 'pattern',
		pattern:'darkTrellis',
		fgColor:{argb:'FFFFFF00'},
		bgColor:{argb:'FF0000FF'}
	  };

	const writefile =  wb.xlsx.writeFile("newdatatest.xlsx");
	return writefile;

}
*/

let port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port ' + port));