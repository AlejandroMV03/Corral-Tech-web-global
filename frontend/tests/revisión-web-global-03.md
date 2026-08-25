Revisión del testeo sobre la plataforma web global

Autor: Andres Dev
Tester: Diego Dev
Fecha: 11/08/26

1. Al momento de querer actualizar el plan de un rancho a otro, este no lo actualiza.
2. Colocar sanitización regex a todos los campos de la web dependiendo de su contexto como: Evitar caracteres no validos, saltos dobles y tambien colocar como limite 14 caracteres en todos los campos.

3. En los reportes en formato PDF y Excel colocar el logotipo, mensaje de confidencialidad y firma de emisor y remitente (Tomar en cuenta los reportes de la versión móvil como ejemplo). (NO SE FINALIZO)

4. Colocar apartado para catalogos base (Datos globales de rancho) y catalogos personalizados (Datos propios para cada rancho). (NO SE FINALIZO)

5. Colocar campo para cambiar la contraseña de usuarios por rancho similar a los usuarios globales.
6. Colocar todos los registros en orden por id y de forma ascendente excepto aquellos registros de historial.
7. Debe mantener la sesión activa aunque se refresque la ventana del navegador con el JWT.
8. La grafica de crecimiento de animales debe ser funcional.

9. En la vista para crear ranchos al momento de crear uno nuevo y habilitar los catalogos personalizados debe redireccionar a otro apartado para colocar los datos personalizados para cada rancho (Como razas unicas u otros que no sean estados globales). (NO SE FINALIZO)

10. Quitar alertas nativas HTML y en su lugar colocar los labels de color rojo que indican el error en el campo tal y como esta en los otros módulos.
11. En reportes globales por rancho las tarjetas enfermos, lotes activos, partos proximos y alertas sanitarias debe ser funcional.
12. Mostrar la lista de todos usuarios globales en el módulo correspondiente.
13. En la edición de cualquier dato si no se ha cambiado algun dato diferente no debe estar habilitado el boton de guardar cambios.
14. Debe estar una boton de flecha para ocultar o mostrar el dasboard.
15. En el dashboard desde el kpi de ranchos claves al momento de hacer clic en el boton de entrar este realiza un parpadeo en blanco.
16. Utilizar la libreria de iconos MaterialCommunityIcons. 