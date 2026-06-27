Revisión del primer testeo sobre la plataforma web global

Autor: Andres Dev
Tester: Alejandro Dev
Fecha: 26/06/26

1° - Campo de telefono: En el campo de telefono me deja escribir letras lo cual por modelo de negocio no deberia dejar escribirlo ni hacer espacios.
2° - Campo de Nombre del Rancho: En este campo igual se permiten añadir numeros y simbolos, no tiene un limite de caracteres para el nombre del rancho.
3° - Campo de Nombre del Propietario Juridico: Lo mismo que los dos campos anteriores, debe mantener validaciones de limite de caracteres, no numeros y simbolos.
4° - Campo de Ubicación geográfica: Este campo deberia tener unas validaciones adecuadas referente al modelo de negocio.
5° - Habilitar Catálogos personalizados: Este check queda a consideración de que si el catalogo personalizado se implementa en este submodulo o en un apartado a consideración del Dev.
6° - Crear Rancho: Bug en el procesando Alta de creación del rancho, al colocar un usuario ya existente y al guardar el nuevo rancho el sistema queda crasheado y despues de un cierto tiempo manda una alerta de que hubo un problema de comunicación.
7° - Bug: Al dar de alta al rancho por alguna razo te saca del sistema y no guarda al rancho, de igual manera queda crasheado.
8° - Si se esta creando un rancho al cambiar a otro modulo, debe mandar una alerta de que se esta ejecutando una tarea y si se cambia esa tarea se cancelaria.
9° - El sistema presenta un crasheo ¡Alarmante!..