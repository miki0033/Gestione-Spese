from flask import Flask, render_template
from flask import request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re  #lib per check sulle regex

import pw

import sys  #serve per debug

from datetime import datetime

app = Flask(__name__)
app.secret_key = pw.SECRET_KEY

#DB config
app.config['MYSQL_HOST'] = pw.DBHOST
app.config['MYSQL_USER'] = pw.DBUSER
app.config['MYSQL_PASSWORD'] = pw.DBPW
app.config['MYSQL_DB'] = pw.DB

mysql = MySQL(app)
#mysql.init_app(app)
import db
if __name__ == "__main__":
    app.run(debug=True)


#Route
@app.route('/')  #0
def home():
    return index()


@app.route('/index')  #1
def index():
    return render_template("index.html")


@app.route('/login', methods=['GET', 'POST'])  #2
def login():
    msg = ''
    if request.method == 'POST' and 'email' in request.form and 'password' in request.form:
        email = request.form['email']
        password = request.form['password']
        password = pw.pwEncode(password)
        #l' oggetto cursor ritorna le righe del database come dizionari
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        #execute esegue la query
        cursor.execute(
            'SELECT * FROM utenti WHERE email = % s AND password = % s', (
                email,
                password,
            ))
        #fetchone() ritorna la prossima riga della tabella, se si è arrivati alla fine ritorna None
        account = cursor.fetchone()
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['firstName'] = account['nome']
            session['lastName'] = account['cognome']
            session['email'] = account['email']
            session['codice_famiglia'] = account['codice_famiglia']
            session['ruolo'] = account['ruolo']
            msg = 'Logged in successfully !'
            if (account['ruolo'] == 'admin'):
                return redirect(url_for('dashboard'))
            else:
                return redirect(url_for('profile'))
        else:
            msg = 'Incorrect username or password!'
    print(msg)
    return render_template('login.html', msg=msg)


@app.route('/logout')  #24
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('firstName', None)
    session.pop('lastName', None)
    session.pop('email', None)
    session.pop('codice_famiglia', None)
    session.pop('ruolo', None)
    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])  #3
def register():
    msg = ''
    if request.method == 'POST' and 'firstName' in request.form and 'lastName' in request.form and 'password' in request.form and 'email' in request.form:
        firstName = request.form['firstName']
        lastName = request.form['lastName']
        password = request.form['password']
        email = request.form['email']
        password = pw.pwEncode(password)
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM utenti WHERE email = % s', (email, ))
        account = cursor.fetchone()
        if account:
            msg = 'Email already registered, plase Log in!'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = 'Invalid email address !'
        elif not firstName or not lastName or not password or not email:
            msg = 'Please fill out the form !'
        else:
            cursor.execute(
                'INSERT INTO utenti VALUES (NULL, % s, % s, % s, % s, NULL, NULL)',
                (firstName, lastName, email, password))
            mysql.connection.commit()  #salva i dati nel database
            msg = 'You have successfully registered !'
            return redirect(url_for('login'))
    elif request.method == 'POST':
        msg = 'Please fill out the form !'
    return render_template('register.html', msg=msg)


#AREA RISERVATA
@app.route('/profile')  #4
def profile():
    if not areaRiservata():
        return redirect(url_for('login'))

    return render_template('profile.html')


@app.route('/family')  #5
def family():
    if not areaRiservata():
        return redirect(url_for('login'))
    if session['codice_famiglia']:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            f'SELECT * FROM utenti WHERE codice_famiglia = {session["codice_famiglia"]}'
        )
        fetch = cursor.fetchall()

        cursor.execute(
            f'SELECT * FROM famiglia WHERE codice = {session["codice_famiglia"]}'
        )
        fam = cursor.fetchone()
        nomeFamiglia = fam['nomefamiglia']
        return render_template("family.html",
                               fetch=fetch,
                               nomeFamiglia=nomeFamiglia)
    else:
        return render_template("family.html")


@app.route('/expense', methods=['GET', 'POST'])  #6
def expense():
    if not areaRiservata():
        return redirect(url_for('login'))
    if session['codice_famiglia']:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        if request.method == 'POST' and 'importo' in request.form and 'categoria' in request.form and 'data' in request.form:
            importo = request.form['importo']
            categoria = request.form['categoria']

            nota = request.form['nota']
            timestamp = request.form['data']
            print(
                f'INSERT INTO spese (id_utente, codice_famiglia, importo, categoria, data, nota) VALUES ({session["id"]}, {session["codice_famiglia"]}, {importo}, {categoria}, {timestamp} , {nota});)',
                file=sys.stdout)
            cursor.execute(
                f'INSERT INTO spese (id_utente, codice_famiglia, importo, categoria, data, nota) VALUES ({session["id"]}, {session["codice_famiglia"]}, {importo}, "{categoria}", "{timestamp}" , "{nota}");'
            )
            mysql.connection.commit()
        cursor.execute(
            f'select sp.id, sp.importo, sp.categoria, sp.data, sp.nota, us.nome from (spese as sp inner join utenti as us  on (sp.id_utente = us.id)) where sp.codice_famiglia =  {session["codice_famiglia"]} ORDER BY sp.data DESC;'
        )
        fetch = cursor.fetchall()
        cursor.execute(f'select * from categorie;')
        category = cursor.fetchall()
        return render_template("expense.html", fetch=fetch, category=category)
    else:
        msg = "Devi Prima creare una famiglia per poter salvare le spese."
        return render_template("expense.html", msg=msg)


@app.route('/chart')  #7
def charts():
    if not areaRiservata():
        return redirect(url_for('login'))
    if session['codice_famiglia']:
        sql = f"select id, nome, cognome from utenti where codice_famiglia={session['codice_famiglia']};"
        fetch = selectDB(sql)
        date = datetime.today().strftime('%Y-%m-%d')
        return render_template("charts.html", fetch=fetch, date=date)
    else:
        msg = "Devi Prima creare una famiglia per poter visualizare i grafici le spese."
        return render_template("charts.html", msg=msg)


#AREA ADMIN
@app.route('/dashboard')  #8
def dashboard():
    if not areaAdmin():
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(f'SELECT COUNT(id) as num FROM utenti;')
    num_users = cursor.fetchone()
    num_users = num_users['num']
    cursor.execute(f'SELECT COUNT(codice) as num FROM famiglia;')
    num_fam = cursor.fetchone()
    num_fam = num_fam['num']
    cursor.execute(f'SELECT AVG(importo) as num FROM spese;')
    avg_exp = cursor.fetchone()
    avg_exp = avg_exp['num']
    if avg_exp:
        avg_exp = round(avg_exp, 2)
    else:
        avg_exp = 0

    return render_template("dashboard.html",
                           num_users=num_users,
                           num_fam=num_fam,
                           avg_exp=avg_exp)


@app.route('/admin_user', methods=['GET', 'POST'])  #9
def adminUser():
    if not areaAdmin():
        return redirect(url_for('login'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(f'SELECT id, nome, cognome, email, ruolo FROM utenti;')
    fetch = cursor.fetchall()
    return render_template("admin_user.html", fetch=fetch)


@app.route('/admin_family', methods=['GET', 'POST'])  #12
def adminFamily():
    if not areaAdmin():
        return redirect(url_for('login'))
    sql = 'SELECT codice, nomefamiglia FROM famiglia;'
    fetch = selectDB(sql)
    return render_template("admin_family.html", fetch=fetch)


@app.route('/admin_expense', methods=['GET', 'POST'])  #15
def adminExpense():
    if not areaAdmin():
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        f'select sp.id, us.nome, us.cognome, sp.importo, sp.categoria, sp.data, sp.nota from spese as sp inner join utenti as us on (sp.id_utente= us.id);'
    )
    fetch = cursor.fetchall()
    return render_template("admin_expense.html", fetch=fetch)


@app.route('/admin_category', methods=['GET', 'POST'])  #15
def adminCategory():
    if not areaAdmin():
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(f'select * from categorie ORDER BY number ASC;')
    fetch = cursor.fetchall()
    return render_template("admin_category.html", fetch=fetch)


@app.route('/add_category', methods=['GET', 'POST'])  #10
def addCategory():
    if not areaAdmin():
        return redirect(url_for('login'))
    if request.method == 'POST' and 'categoria' in request.form and 'colore' in request.form:
        categoria = request.form['categoria']
        colore = request.form['colore']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            f"INSERT INTO categorie (categoria, colore) VALUES  ('{categoria}', '{colore}')"
        )
        mysql.connection.commit()

    return redirect(url_for('adminCategory'))


@app.route('/modify_user/<string:id>', methods=['GET', 'POST'])
def modify_user(id):
    if areaAdmin():  #10
        if request.method == 'POST' and 'firstName' in request.form and 'lastName' in request.form and 'email' in request.form and 'role' in request.form:
            nome = request.form['firstName']
            cognome = request.form['lastName']
            email = request.form['email']
            ruolo = request.form['role']
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute(
                f"UPDATE utenti SET nome = '{nome}', cognome= '{cognome}', email = '{email}', ruolo = '{ruolo}' WHERE id = {id};"
            )
        mysql.connection.commit()
        return redirect(url_for('adminUser'))
    elif areaRiservata():  #20
        if request.method == 'POST' and 'firstName' in request.form and 'lastName' in request.form:
            nome = request.form['firstName']
            cognome = request.form['lastName']

            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute(
                f"UPDATE utenti SET nome = '{nome}', cognome= '{cognome}' WHERE id = {session['id']};"
            )
        mysql.connection.commit()
        return redirect(url_for('profile'))
    else:
        return redirect(url_for('login'))


@app.route('/delete_user/<string:id>')  #11
def delete_user(id):
    if not areaAdmin():
        return redirect(url_for('login'))
    sql = f"DELETE FROM utenti WHERE id={id};"
    modifyDB(sql)
    return redirect(url_for('adminUser'))


#13
@app.route('/remove_user/<string:id>', methods=['GET', 'POST'])
def modify_family(id):
    if not areaRiservata:
        return redirect(url_for('login'))
    sql = f"UPDATE utenti SET codice_famiglia = NULL WHERE id={id};"
    modifyDB(sql)
    return redirect(url_for('family'))


@app.route('/delete_family/<string:codice_famiglia>')  #14
def delete_family(codice_famiglia):
    if not areaAdmin():
        return redirect(url_for('login'))
    sql = f"DELETE FROM famiglia WHERE codice={codice_famiglia};"
    modifyDB(sql)
    return redirect(url_for('adminFamily'))


@app.route('/modify_expense/<string:id>', methods=['GET', 'POST'])  #16
def modify_expense(id):
    if areaAdmin():
        if request.method == 'POST' and 'importo' in request.form and 'categoria' in request.form and 'data' in request.form and 'nota' in request.form:
            importo = request.form['importo']
            categoria = request.form['categoria']
            data = request.form['data']
            nota = request.form['nota']
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute(
                f"UPDATE spese SET importo = '{importo}', categoria= '{categoria}', data = '{data}', nota = '{nota}' WHERE id = {id};"
            )
        mysql.connection.commit()
        return redirect(url_for('adminExpense'))
    else:
        return redirect(url_for('login'))


@app.route('/delete_expense/<string:id>')  #17
def delete_expense(id):
    if areaAdmin():
        sql = f"DELETE FROM spese WHERE id={id};"
        modifyDB(sql)
        return redirect(url_for("adminExpense"))
    elif areaRiservata():
        sql = f"DELETE FROM spese WHERE id={id} AND codice_famiglia={session['codice_famiglia']};"
        modifyDB(sql)
        return redirect(url_for("expense"))
    else:
        return redirect(url_for('login'))


@app.route('/edit/<string:table>/<string:id>')
def edit(table, id):
    view_user = "none"
    view_fam = "none"
    view_exp = "none"
    view_cat = "none"
    if table == "user":
        view_user = "block"
        sql = f"select nome, cognome, email, ruolo from utenti where id ={id};"
        fetch = selectOneDB(sql)
    #elif table == "family":
    #    view_user = "block"
    elif table == "expense":  #16
        view_exp = "block"
        sql = f"select importo, categoria, data, nota from spese where id ={id};"
        fetch = selectOneDB(sql)
        ct = f'select * from categorie;'
        category = selectDB(ct)
    elif table == "category":
        view_cat = "block"
        sql = f"select categoria, colore from categorie where categoria ='{id}';"
        fetch = selectOneDB(sql)
        ct = f'select * from categorie;'
        category = selectDB(ct)
    return render_template("edit.html",
                           id=id,
                           fetch=fetch,
                           category=category,
                           view_user=view_user,
                           view_fam=view_fam,
                           view_exp=view_exp,
                           view_cat=view_cat)


@app.route('/modify_category/<string:id>', methods=['GET', 'POST'])
def modify_category(id):
    if areaAdmin():
        if request.method == 'POST' and 'categoria' in request.form and 'colore' in request.form:
            categoria = request.form['categoria']
            colore = request.form['colore']
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute(
                f"UPDATE categorie SET categoria= '{categoria}', colore = '{colore}' WHERE categoria = '{id}';"
            )
        mysql.connection.commit()
        return redirect(url_for('adminCategory'))
    else:
        return redirect(url_for('login'))


#FUNZIONI
def areaRiservata():
    try:
        if session['loggedin']:
            return True
        else:
            redirect(url_for('login'))
    except:
        redirect(url_for('login'))


def areaAdmin():
    try:
        if session['loggedin'] and session['ruolo'] == 'admin':
            return True
        else:
            return False
    except:
        return False


def convertDateIntoTimestamp(data):
    import time
    import datetime
    element = datetime.datetime.strptime(data, "%Y-%m-%d")
    tuple = element.timetuple()
    timestamp = time.mktime(tuple)
    timestamp = int(timestamp)
    return timestamp


def convertTimestampIntoDate(timestamp):
    from datetime import datetime
    # convert the timestamp to a datetime object in the local timezone
    dt_object = datetime.fromtimestamp(timestamp)
    date = dt_object.strftime("%d/%m/%Y")
    return date


#comunicazione con il database
def selectDB(sql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(sql)
    fetch = cursor.fetchall()
    return fetch


def selectOneDB(sql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(sql)
    fetch = cursor.fetchone()
    return fetch


def modifyDB(sql):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(sql)
    mysql.connection.commit()


#API
@app.route('/new_family', methods=['POST'])
def new_family():
    if request.method == 'POST' and 'family' in request.form:
        family = request.form['family']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        db.insertQuery('famiglia', db.arrfy('nomefamiglia'), db.arrfy(family))
        #assegno il codice
        sql = f"SELECT * FROM famiglia WHERE nomefamiglia='{family}'"
        cursor.execute(sql)
        row = cursor.fetchone()
        codice = (row['codice'])
        session['codice_famiglia'] = codice
        session['ruolo'] = "Capofamiglia"
        #salvo il codice e il ruolo nel database
        insert = f"UPDATE utenti SET codice_famiglia={codice}, ruolo='{session['ruolo']}' WHERE id={session['id']};"
        cursor.execute(insert)
        mysql.connection.commit()

    return redirect(url_for('family'))


@app.route('/join_family', methods=['POST'])
def join_family():
    if request.method == 'POST' and 'codice_famiglia' in request.form:
        codice_famiglia = request.form['codice_famiglia']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        #controllare se il codice esiste
        sql = f"SELECT * FROM famiglia WHERE codice='{codice_famiglia}'"
        nRow = cursor.execute(sql)
        if nRow:
            #se esiste inserire l'utente nel database e aggiurnare il ruolo
            insert = f"UPDATE utenti SET codice_famiglia={codice_famiglia}, ruolo='Membro' WHERE id={session['id']};"
            cursor.execute(insert)
            mysql.connection.commit()
            session['codice_famiglia'] = codice_famiglia
        else:  #se non esiste msg di errore
            error = "Codice famiglia non trovato"
            return render_template('family.html', error=error)

    return redirect(url_for('family'))


@app.route('/getchartsdata/<string:codice_famiglia>', methods=['GET'])
def getDataCharts(codice_famiglia):
    from flask import json
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        f'select sp.importo, sp.categoria, sp.data, sp.nota, sp.id_utente, us.nome, ct.colore from ((spese as sp inner join utenti as us  on (sp.id_utente = us.id)) inner join categorie as ct on (sp.categoria = ct.categoria) )where sp.codice_famiglia = {codice_famiglia};'
    )
    fetch = cursor.fetchall()

    response = app.response_class(response=json.dumps(fetch),
                                  status=200,
                                  mimetype='application/json')
    return response


@app.route('/getcategorydata', methods=['GET'])
def getDataCategory():
    from flask import json
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        f'select sp.importo, sp.categoria, sp.data, sp.nota, sp.id_utente, us.nome, ct.colore from ((spese as sp inner join utenti as us  on (sp.id_utente = us.id)) inner join categorie as ct on (sp.categoria = ct.categoria) );'
    )
    fetch = cursor.fetchall()

    response = app.response_class(response=json.dumps(fetch),
                                  status=200,
                                  mimetype='application/json')
    return response
