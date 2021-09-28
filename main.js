
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var session = require('express-session');
var flash = require('connect-flash');

var dateTime = require('node-datetime');
var dt = dateTime.create();
var datetimeF = dt.format('YmdHMS');

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "admin",
  database: "wmsdb",
  port:"3306"
});

con.connect(function(err) {
	//if (err) throw err;
	console.log("Connected!");
  });
 

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
	var remark = request.body.remarks;
	

		con.query("INSERT INTO iteminfo VALUES (?,?,?,?,?);", [itemid, selectCategory,remark,request.session.userid,datetimeF], function(error, results, fields) {	
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
	
	
		con.query('SELECT * FROM iteminfo WHERE itemid = ? or category = ?', [itemid, selectCategory], function(error, results, fields) {	
		if (error) throw error;
		
			if (results.length > 0) {
				
				
			//	var userid = results[0].userid;
			//	var job = results[0].job;
				
				

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

});


app.post('/passtoUpdate', function(request, response) {
	var itemid = request.body.itemid;
	var selectCategory = request.body.category;
	var remark = request.body.remarks;
	
	
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
	var remark = request.body.remarks;
	var user = request.session.userid;
	
	con.query('update iteminfo set category=?, remark=?, user=?, datetime=? where itemid=?', [selectCategory, remark, user, datetimeF,itemid], function(error, results, fields) {	
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
	var selectCategory = request.body.category;
	var remark = request.body.remarks;
	
	
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





let port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port ${port}!'));