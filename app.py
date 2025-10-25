from flask import Flask, render_template, request, redirect, url_for, session
from functools import wraps

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_aqui'  # Cambia esto por una clave secreta segura

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Página de inicio
@app.route('/')
def index():
    return render_template('index.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        # Aquí deberías verificar las credenciales contra tu base de datos
        # Por ahora, solo simulamos una autenticación exitosa
        session['user_id'] = email  # Guardamos el email como ID de usuario
        session['is_authenticated'] = True
        return redirect(url_for('index'))
    return render_template('login.html')

# Registro
@app.route('/register', methods=['POST'])
def register():
    nombre = request.form.get('nombre')
    apellido = request.form.get('apellido')
    email = request.form.get('email')
    password = request.form.get('password')
    fecha_nacimiento = request.form.get('fecha_nacimiento')
    dni = request.form.get('dni')
    direccion = request.form.get('direccion')
    return redirect(url_for('login'))

# Página general con todos los productos
@app.route('/productos')
def productos():
    return render_template('productos.html')

# Productos Carne de Res
@app.route('/productos_res')
def productos_res():
    return render_template('productos_res.html')

# Productos Carne de Cerdo
@app.route('/productos_cerdo')
def productos_cerdo():
    return render_template('productos_cerdo.html')

# Productos Carne de Pollo
@app.route('/productos_pollo')
def productos_pollo():
    return render_template('productos_pollo.html')

# Ruta de pagos (protegida)
@app.route('/pagos')
@login_required
def pagos():
    return render_template('pagos.html')

# Cerrar sesión
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Carrito (protegido)
@app.route('/carrito')
@login_required
def carrito():
    return render_template('carrito.html')

# ✅ Página Nosotros (debe ir antes del if __name__ == '__main__')
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



if __name__ == '__main__':
    app.run(debug=True)
