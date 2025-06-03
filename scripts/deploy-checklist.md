# 🚨 Lista de Verificación para Solucionar Error 403 en Producción

## **Problema Detectado:**
- Todos los endpoints API devuelven 403 Forbidden
- El servidor devuelve HTML en lugar de JSON
- Las páginas también devuelven 403

## **🔧 Soluciones Ordenadas por Prioridad:**

### **1. 🔥 REDEPLOYMENT COMPLETO (MÁS PROBABLE)**
```bash
# En tu servidor de producción:
npm run build
# o
yarn build

# Reiniciar el proceso de Next.js
pm2 restart all
# o si usas otro proceso manager
systemctl restart your-app
```

### **2. 🌐 VERIFICAR CONFIGURACIÓN NGINX/APACHE**
```nginx
# Ejemplo configuración nginx correcta:
server {
    listen 80;
    server_name www.eterealconquest.com;

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **3. 📁 VERIFICAR PERMISOS DE ARCHIVOS**
```bash
# En tu servidor:
chmod -R 755 /path/to/your/app
chown -R www-data:www-data /path/to/your/app
```

### **4. 🔍 VERIFICAR VARIABLES DE ENTORNO**
```bash
# Verificar que estas variables estén configuradas:
echo $NEXT_PUBLIC_BASE_URL
echo $SQL_DB_HOST
echo $RESEND_API_KEY

# Verificar archivo .env.production
cat .env.production
```

### **5. 🔄 LIMPIAR CACHE Y BUILD**
```bash
# Limpiar completamente:
rm -rf .next
rm -rf node_modules
npm install
npm run build
pm2 restart all
```

### **6. 📊 VERIFICAR LOGS DEL SERVIDOR**
```bash
# Logs de nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs de aplicación
pm2 logs
# o
tail -f /var/log/your-app.log
```

### **7. 🛡️ VERIFICAR FIREWALL/SEGURIDAD**
```bash
# Verificar iptables
sudo iptables -L

# Verificar fail2ban
sudo fail2ban-client status

# Verificar cloudflare/security rules si las tienes
```

## **🧪 TESTS PARA VERIFICAR SOLUCIÓN:**

### **Test 1: API Local**
```bash
curl -X POST http://localhost:3000/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"test123"}'
```

### **Test 2: API Producción**
```bash
curl -X POST https://www.eterealconquest.com/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"test123"}'
```

### **Test 3: Verificar Headers**
```bash
curl -I https://www.eterealconquest.com/api/verify-email
```

## **📞 CONTACTAR HOSTING PROVIDER SI:**

1. **Ninguna solución funciona**
2. **No tienes acceso SSH al servidor**
3. **Usas hosting managed (Vercel, Netlify, etc.)**
4. **El problema persiste después de redeployment**

### **Información para el soporte:**
- **Error**: Todos los endpoints devuelven 403 Forbidden + HTML
- **Esperado**: APIs deben devolver JSON
- **Framework**: Next.js
- **Rutas afectadas**: `/api/*` y páginas principales

## **🎯 SOLUCIÓN MÁS PROBABLE:**

**90% de probabilidad:** Problema de **redeployment/build** corrupto.

**Acción recomendada:**
1. Hacer `npm run build` completo
2. Reiniciar proceso Node.js
3. Verificar que el build se completó sin errores

---

**Si el problema persiste después de estas acciones, el issue está en la configuración del servidor web (nginx/apache) y necesitas acceso SSH o contactar al proveedor de hosting.** 