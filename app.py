from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)

# ✅ Configuración de conexión a tu base de datos AWS RDS
app.secret_key = 'clave_secreta_segura'
app.config['MYSQL_HOST'] = 'paginaweb.ctm2km48677s.us-east-1.rds.amazonaws.com'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'admin'  # usuario RDS
app.config['MYSQL_PASSWORD'] = '123456789'  # contraseña RDS
app.config['MYSQL_DB'] = 'pochitoweb'  # nombre de la base de datos

# Inicializar conexión
mysql = MySQL(app)

# 🔒 Decorador para rutas protegidas
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


# 🏠 Página principal
@app.route('/')
def index():
    return render_template('index.html')


# 🔐 Iniciar sesión
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM usuarios WHERE email=%s", (email,))
        user = cur.fetchone()
        cur.close()

        # Verificar contraseña
        if user and check_password_hash(user[4], password):  # índice 4 = columna password
            session['user_id'] = user[0]
            session['is_authenticated'] = True
            return redirect(url_for('carrito'))
        else:
            return "❌ Usuario o contraseña incorrectos"

    return render_template('login.html')


# 🧾 Registro de nuevo usuario
@app.route('/register', methods=['POST'])
def register():
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    email = request.form.get('email')
    password = request.form.get('password')
    fecha_nacimiento = request.form.get('fecha_nacimiento')
    dni = request.form.get('dni')
    direccion = request.form.get('direccion')

    if not (nombre and apellido and email and password):
        return "⚠️ Todos los campos obligatorios deben ser llenados."

    hashed_password = generate_password_hash(password)

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO usuarios (nombre, apellido, email, password, fecha_nacimiento, dni, direccion)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (nombre, apellido, email, hashed_password, fecha_nacimiento, dni, direccion))
    mysql.connection.commit()
    user_id = cur.lastrowid
    cur.close()

    session['user_id'] = user_id
    session['is_authenticated'] = True
    return redirect(url_for('carrito'))


# 🥩 Rutas de productos
@app.route('/productos')
def productos():
    return render_template('productos.html')

@app.route('/productos_res')
def productos_res():
    return render_template('productos_res.html')

@app.route('/productos_cerdo')
def productos_cerdo():
    return render_template('productos_cerdo.html')

@app.route('/productos_pollo')
def productos_pollo():
    return render_template('productos_pollo.html')


# 🛒 Carrito y pagos (protegidos)
@app.route('/carrito')
@login_required
def carrito():
    return render_template('carrito.html')

@app.route('/pagos')
@login_required
def pagos():
    return render_template('pagos.html')


# ℹ️ Otras páginas
@app.route('/nosotros')
def nosotros():
    return render_template('nosotros.html')

@app.route('/cuchillos')
def cuchillos():
    return render_template('cuchillos.html')

@app.route('/parrillas')
def parrillas():
    return render_template('parrillas.html')

@app.route('/limpieza')
def limpieza():
    return render_template('limpieza.html')

@app.route('/encendido')
def encendido():
    return render_template('encendido.html')

@app.route('/adicionales')
def adicionales():
    return render_template('adicionales.html')


# 📚 Libro de Recomendaciones
@app.route('/recomendaciones', methods=['GET', 'POST'])
@login_required
def recomendaciones():
    cur = mysql.connection.cursor()

    if request.method == 'POST':
        user_id = session.get('user_id')
        mensaje = request.form.get('mensaje')

        # 🧠 Depuración: Ver qué se recibe
        print("🔹 Método:", request.method)
        print("🔹 Mensaje recibido:", mensaje)
        print("🔹 Usuario ID en sesión:", user_id)

        if mensaje and user_id:
            cur.execute("INSERT INTO recomendaciones (usuario_id, mensaje) VALUES (%s, %s)", (user_id, mensaje))
            mysql.connection.commit()
            print("✅ Recomendación guardada con éxito")
        else:
            print("⚠️ No se recibió mensaje o usuario_id")

    # Mostrar todas las recomendaciones
    cur.execute("""
        SELECT u.nombre, u.apellido, r.mensaje, r.fecha
        FROM recomendaciones r
        JOIN usuarios u ON r.usuario_id = u.id
        ORDER BY r.fecha DESC
    """)
    recomendaciones = cur.fetchall()
    cur.close()

    return render_template('recomendaciones.html', recomendaciones=recomendaciones)


# 🧍‍♂️ Perfil de usuario (🔹 Nueva ruta añadida)
@app.route('/perfil')
@login_required
def perfil():
    user_id = session.get('user_id')
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre, apellido, email, fecha_nacimiento, dni, direccion FROM usuarios WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()

    if not user:
        return "⚠️ Usuario no encontrado"

    # Convertir a diccionario
    user_data = {
        'id': user[0],
        'nombre': user[1],
        'apellido': user[2],
        'email': user[3],
        'fecha_nacimiento': user[4],
        'dni': user[5],
        'direccion': user[6]
    }

    return render_template('perfil.html', user=user_data)


# 🚪 Cerrar sesión
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


# 🧪 Ruta de prueba de conexión (opcional)
@app.route('/test_db')
def test_db():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT DATABASE();")
        db_name = cur.fetchone()
        return f"✅ Conectado a la base de datos: {db_name[0]}"
    except Exception as e:
        return f"❌ Error al conectar: {e}"


# 🚀 Ejecutar servidor
if __name__ == '__main__':
    app.run(debug=True)
