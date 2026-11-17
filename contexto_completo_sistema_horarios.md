# Documento de contexto del proyecto
## Sistema de asignación automática de horarios académicos mediante algoritmos de optimización y análisis de complejidad computacional

**Tipo:** Especificación funcional y técnica para proporcionar contexto a una IA o equipo de desarrollo.  
**Idioma:** Español.  
**Estado:** Especificación inicial del proyecto.

---

# 1. Instrucciones para la IA que utilizará este documento

Actúa como arquitecto de software y desarrollador sénior, pero acompaña el desarrollo como un tutor paciente. Lee este documento completo antes de proponer cambios o escribir código.

Debes cumplir estas reglas:

1. Desarrolla el sistema progresivamente, en pasos pequeños y verificables. No entregues todo el proyecto de una sola vez.
2. No conviertas el proyecto en un CRUD convencional. Su propósito central es implementar y comparar algoritmos de asignación de horarios y analizar su complejidad computacional.
3. Antes de modificar archivos existentes, revisa el repositorio, los archivos, la configuración y la base de datos.
4. No supongas que una etapa está terminada. Comprueba su funcionamiento antes de avanzar.
5. No inventes tablas, campos, endpoints, dependencias, datos institucionales ni resultados experimentales.
6. Si falta información, pregunta o declara claramente la suposición.
7. Aplica Clean Code, separación de responsabilidades, tipado estricto, modularidad, validación, manejo centralizado de errores y pruebas.
8. Mantén el motor algorítmico independiente de Express, Prisma, MySQL y React.
9. Explica qué hace cada archivo, por qué existe y cómo probarlo. Proporciona comandos para Windows/PowerShell cuando corresponda.
10. No declares que un horario es óptimo si el algoritmo no lo demuestra. Distingue horario válido, solución factible y calidad de la solución.
11. Los datos de ejemplo son ficticios y nunca deben presentarse como datos reales de una universidad.
12. Si existe una diferencia entre este documento, el esquema real de MySQL y el código, explica la diferencia y propone una corrección segura. No modifiques la base de datos silenciosamente.
13. En cada etapa, indica qué se completó, qué pruebas deben pasar y cuál es el siguiente paso.
14. No reescribas todo el proyecto para solucionar un error puntual. Analiza el error y realiza cambios mínimos y justificados.

---

# 2. Nombre y descripción del proyecto

**Título:** “Desarrollo de un sistema de asignación automática de horarios académicos mediante algoritmos de optimización y análisis de complejidad computacional”.

El proyecto consiste en desarrollar un sistema web que ayude a organizar horarios académicos. A partir de asignaturas, docentes, grupos, minutos semanales requeridos y disponibilidad docente, el sistema generará propuestas de horarios que respeten restricciones definidas.

El aspecto académico central es implementar y comparar dos estrategias:

- **Greedy (voraz):** construye una solución tomando decisiones locales en cada paso.
- **Backtracking (retroceso):** explora alternativas y retrocede cuando una decisión impide continuar.

Ambos algoritmos deben trabajar con el mismo modelo, restricciones y entradas equivalentes. Se medirán sus resultados, tiempos y operaciones para estudiar su comportamiento y analizar la complejidad.

El sistema no debe limitarse a almacenar información: debe demostrar cómo se modela el problema, cómo se generan y validan soluciones y cómo se comportan los algoritmos.

# 3. Problema y objetivos

La elaboración manual de horarios puede producir cruces de clases para un docente, clases simultáneas para un grupo, asignaciones fuera de disponibilidad, incumplimiento de horas semanales y distribuciones poco convenientes.

## Objetivo general

Desarrollar un sistema web que genere y valide propuestas de horarios académicos mediante Greedy y Backtracking, y permita comparar su rendimiento y comportamiento desde la perspectiva de la complejidad computacional.

## Objetivos específicos

1. Modelar la información académica necesaria.
2. Registrar asignaturas, docentes, grupos, asignaciones y disponibilidad.
3. Convertir horas semanales en sesiones individuales.
4. Definir restricciones obligatorias.
5. Implementar un validador independiente.
6. Implementar Greedy.
7. Implementar Backtracking con poda.
8. Medir tiempo y operaciones relevantes.
9. Comparar los algoritmos con entradas equivalentes.
10. Mostrar horarios y métricas en una interfaz.
11. Documentar limitaciones, experimentos y complejidad.

# 4. Alcance

## Incluido

- CRUD de docentes, asignaturas, grupos y períodos académicos.
- Asignación de asignatura, docente, grupo y período.
- Minutos semanales requeridos.
- División de minutos en sesiones.
- Disponibilidad semanal de docentes.
- Generación de sesiones y candidatos horarios.
- Generación de horarios mediante Greedy y Backtracking.
- Validación de restricciones.
- Puntuación de calidad según criterios definidos.
- Registro de ejecuciones, resultados y métricas.
- Calendario semanal y comparación gráfica.

## Fuera del alcance inicial

- Asignación de aulas o salones.
- Matrícula individual de estudiantes.
- Calificaciones, asistencia, facturación, nómina o expedientes.
- Integración con sistemas institucionales externos.

**Limitación:** al no incluir aulas, el sistema no comprueba conflictos de uso de salones. Esta limitación debe documentarse.

# 5. Conceptos del dominio

- **Período académico:** intervalo en el que se organiza la oferta académica.
- **Docente:** persona que imparte una asignatura.
- **Grupo:** conjunto de estudiantes que comparte un horario.
- **Asignatura:** materia académica.
- **Asignación académica:** relación entre asignatura, docente, grupo y período, con minutos semanales requeridos.
- **Requerimiento de sesiones:** cantidad y duración de sesiones necesarias para cumplir los minutos semanales.
- **Disponibilidad docente:** intervalos de días y horas en los que el docente puede impartir clases.
- **Sesión programable:** clase individual que debe ubicarse en un día y una franja horaria.
- **Ejecución:** intento de generar un horario con un algoritmo y configuración determinados.
- **Restricción dura:** regla obligatoria.
- **Restricción blanda:** preferencia que mejora la calidad, pero cuyo incumplimiento no necesariamente invalida el horario.

# 6. Reglas del problema

## 6.1 Restricciones duras

Un horario es válido solamente si cumple todas las reglas obligatorias.

1. **Sin cruces de docente:** un docente no puede impartir dos clases simultáneas.
2. **Sin cruces de grupo:** un grupo no puede recibir dos clases simultáneas.
3. **Disponibilidad:** cada sesión debe estar completamente dentro de un intervalo de disponibilidad del docente.
4. **Minutos semanales:** la suma de las duraciones programadas para cada asignación debe coincidir con los minutos requeridos.
5. **Duración:** cada sesión debe tener la duración indicada por su requerimiento.
6. **Jornada y días:** respetar la configuración institucional.
7. **No duplicidad:** cada sesión lógica debe programarse la cantidad de veces requerida, sin duplicarse.

Valores iniciales de demostración, configurables y no oficiales:
- Días: lunes a viernes.
- Jornada: 07:00 a 18:00.
- Cuadrícula de inicio: cada 30 minutos.

La cuadrícula de 30 minutos limita los posibles inicios; no significa que todas las sesiones deban durar 30 minutos.

## 6.2 Representación del tiempo

Utilizar minutos desde medianoche:

- 07:00 = 420.
- 08:00 = 480.
- 08:30 = 510.
- 12:00 = 720.
- 18:00 = 1080.

Dos intervalos A y B se solapan cuando:

```text
inicioA < finB Y finA > inicioB
```

Ejemplos:
- 08:00–10:00 y 09:00–11:00: conflicto.
- 08:00–10:00 y 10:00–12:00: no hay conflicto.
- 08:00–10:00 y 08:30–09:30: conflicto.

Los intervalos que se tocan exactamente en el límite no se consideran solapados.

## 6.3 Restricciones blandas

Se pueden utilizar criterios de calidad como:
- Reducir huecos entre clases de un grupo.
- Evitar demasiadas horas de un grupo en un solo día.
- Distribuir sesiones durante la semana.
- Considerar preferencias docentes si se incorporan formalmente.

Separar validez de calidad. La puntuación debe tener una fórmula, criterios y pesos documentados. No llamar óptimo a un horario solo porque tenga una puntuación alta.

# 7. Base de datos MySQL

La base de datos existente se llama `academic_scheduler` y utiliza MySQL 8 con `utf8mb4`.

## 7.1 Tablas existentes

### `academic_periods`
Períodos académicos:
- `id`: identificador.
- `name`: nombre.
- `start_date`, `end_date`: fechas del período.
- `status`: `ACTIVE`, `INACTIVE` o `CLOSED`.
- `created_at`: fecha de creación.

La fecha final debe ser igual o posterior a la inicial.

### `teachers`
Docentes:
- `id`
- `first_name`
- `last_name`
- `email` (único, opcional)
- `phone` (opcional)
- `active`
- `created_at`

### `student_groups`
Grupos:
- `id`
- `code` (único)
- `name`
- `semester_number` (opcional)
- `student_count`
- `active`
- `created_at`

### `subjects`
Asignaturas:
- `id`
- `code` (único)
- `name`
- `description` (opcional)
- `credits` (opcional)
- `active`
- `created_at`

### `course_assignments`
Relaciona asignatura, docente, grupo y período:
- `id`
- `subject_id` → `subjects.id`
- `teacher_id` → `teachers.id`
- `group_id` → `student_groups.id`
- `period_id` → `academic_periods.id`
- `weekly_minutes`
- `active`
- `created_at`

Tiene una restricción única sobre `(subject_id, teacher_id, group_id, period_id)`. Una asignatura puede impartirse a diferentes grupos y un docente puede impartir varias asignaturas.

### `session_requirements`
Define la división de los minutos semanales:
- `id`
- `assignment_id` → `course_assignments.id`
- `duration_minutes`
- `quantity`
- `created_at`

Regla de negocio:

```text
SUM(duration_minutes * quantity) = course_assignments.weekly_minutes
```

Ejemplo: 240 minutos semanales se pueden dividir en 2 sesiones de 120 minutos. Puede haber varias filas de requerimientos para una asignación si las sesiones tienen distintas duraciones.

Esta suma entre tablas debe validarse en la aplicación y dentro de una operación transaccional; el esquema actual no la garantiza automáticamente.

### `teacher_availability`
Disponibilidad:
- `id`
- `teacher_id` → `teachers.id`
- `day_of_week` (1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes, 6 sábado, 7 domingo)
- `start_minute`
- `end_minute`
- `created_at`

Ejemplo: 08:00 a 12:00 = 480 a 720. La disponibilidad representa intervalos permitidos. No existe todavía un campo para representar explícitamente indisponibilidad.

### `schedule_runs`
Registra cada ejecución:
- `id`
- `period_id` → `academic_periods.id`
- `algorithm`: `GREEDY` o `BACKTRACKING`
- `status`: `PENDING`, `RUNNING`, `COMPLETED`, `NO_SOLUTION`, `LIMIT_REACHED` o `ERROR`
- `started_at`, `finished_at`
- `duration_ms`
- `operations`
- `nodes_visited`
- `backtracks`
- `assigned_sessions`
- `unassigned_sessions`
- `conflicts_found`
- `quality_score`
- `input_snapshot` (JSON)
- `metrics_json` (JSON)
- `created_at`

La instantánea de entrada permite reproducir una comparación aunque los datos originales cambien después.

### `schedule_sessions`
Cada fila representa una clase programada:
- `id`
- `run_id` → `schedule_runs.id`
- `requirement_id` → `session_requirements.id`
- `session_number`
- `day_of_week`
- `start_minute`
- `end_minute`
- `created_at`

## 7.2 Relaciones

- Un período tiene muchas asignaciones.
- Una asignatura tiene muchas asignaciones.
- Un docente tiene muchas asignaciones y disponibilidades.
- Un grupo tiene muchas asignaciones.
- Una asignación tiene uno o varios requerimientos de sesiones.
- Un período tiene muchas ejecuciones.
- Una ejecución contiene muchas sesiones.
- Un requerimiento puede aparecer en sesiones de diferentes ejecuciones.

## 7.3 Prisma y esquema existente

La base fue creada primero mediante SQL. Prisma debe leerla, no recrearla:

```bash
npx prisma db pull
npx prisma generate
```

Revisar `prisma/schema.prisma`. Los nombres de modelos generados pueden diferir de los nombres SQL. Si se renombran modelos o campos para TypeScript, usar `@@map` y `@map` para conservar el mapeo con las tablas y columnas reales.

No asumir que existe `prisma.teachers`: verificar el nombre real del modelo generado. No ejecutar una migración que intente crear nuevamente las tablas existentes. No subir `.env` a GitHub.

# 8. Tecnologías y arquitectura

| Capa | Tecnología | Uso |
|---|---|---|
| Lenguaje | TypeScript | Código del sistema |
| Entorno | Node.js | Ejecución del backend |
| API | Express | Endpoints HTTP |
| Base de datos | MySQL 8 | Persistencia |
| ORM | Prisma | Acceso a datos |
| Pruebas | Vitest | Pruebas automatizadas |
| Frontend | Next.js y React | Interfaz |
| Estilos | Tailwind CSS | Diseño |
| Calendario | FullCalendar | Horario semanal |
| Gráficos | Recharts | Comparaciones |
| Versionado | Git/GitHub | Historial |

## 8.1 Flujo de comunicación

```text
USUARIO
   |
   v
FRONTEND (Next.js / React)
   |
   | HTTP / JSON
   v
API REST (Express)
   |
   v
CONTROLADORES
   |
   v
SERVICIOS DE APLICACIÓN
   |                         |
   v                         v
REPOSITORIOS / PRISMA    MOTOR DE PLANIFICACIÓN
   |                     TypeScript independiente
   v                         |
MYSQL 8                      |
   ^                         |
   +------ Guardar resultado y métricas
```

### Responsabilidades

**Frontend**
- Formularios y listados.
- Administración de datos.
- Solicitud de generación.
- Calendario y métricas.
- No debe ser la única capa que valide reglas críticas.

**API Express**
- Recibir solicitudes.
- Validar parámetros y cuerpos.
- Invocar servicios.
- Gestionar códigos HTTP y respuestas JSON.
- No implementar los algoritmos directamente.

**Servicios**
- Coordinar casos de uso.
- Consultar repositorios.
- Construir la entrada del motor.
- Ejecutar el algoritmo.
- Validar y guardar el resultado.

**Repositorios**
- Encapsular persistencia mediante Prisma.
- No filtrar detalles de Prisma hacia el motor.

**Motor**
- Recibir objetos TypeScript simples.
- Generar sesiones y candidatos.
- Validar restricciones.
- Ejecutar Greedy y Backtracking.
- Calcular métricas y calidad.
- No importar Express, Prisma, React ni acceder directamente a MySQL.

# 9. Estructura recomendada

```text
academic-scheduler/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── environment.ts
│   │   ├── modules/
│   │   │   ├── teachers/
│   │   │   ├── subjects/
│   │   │   ├── groups/
│   │   │   ├── periods/
│   │   │   ├── assignments/
│   │   │   ├── availability/
│   │   │   ├── scheduling/
│   │   │   └── analytics/
│   │   ├── engine/
│   │   │   ├── domain/
│   │   │   ├── session-generator/
│   │   │   ├── candidate-generator/
│   │   │   ├── validation/
│   │   │   ├── algorithms/
│   │   │   │   ├── greedy/
│   │   │   │   └── backtracking/
│   │   │   ├── optimization/
│   │   │   └── metrics/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── shared/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── engine/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/
├── docs/
│   ├── arquitectura.md
│   ├── reglas-del-problema.md
│   └── experimentos/
└── README.md
```

Ajustar esta estructura al repositorio real. No crear abstracciones o carpetas vacías sin necesidad.

# 10. Flujo completo de planificación

1. El usuario selecciona un período.
2. Selecciona Greedy o Backtracking.
3. La API verifica que el período y los datos estén disponibles.
4. El servicio obtiene asignaciones activas.
5. Obtiene requerimientos de sesiones y disponibilidad docente.
6. Construye una entrada completa e inmutable para el motor.
7. Conserva una instantánea de los datos de entrada.
8. El generador crea las sesiones individuales.
9. El generador de candidatos calcula días y horas posibles.
10. El algoritmo intenta ubicar todas las sesiones.
11. El validador independiente comprueba el resultado.
12. Se calculan o recopilan métricas.
13. Se guardan ejecución y sesiones en una transacción.
14. La API devuelve el identificador y resumen.
15. El frontend muestra calendario, pendientes y métricas.

No guardar un horario como válido si el validador encuentra incumplimientos duros.

## 10.1 Generación de sesiones

Ejemplo: Programación I, grupo 1INF-A, Docente A, 240 minutos semanales, dos sesiones de 120 minutos.

El generador crea dos sesiones sin día ni hora asignados. Cada sesión debe incluir identificador interno, asignación, requerimiento, número, docente, grupo y duración.

## 10.2 Generación de candidatos

Un candidato combina:
- Día permitido.
- Hora de inicio permitida.
- Hora final calculada con la duración de la sesión.

Debe respetar jornada, disponibilidad docente y cuadrícula de inicio. La validación contra las sesiones ya colocadas se realiza con las restricciones de ocupación.

La lista de candidatos debe ser determinista para una misma entrada, salvo que se incorpore aleatoriedad explícita y se registre su semilla.

# 11. Algoritmo Greedy

## Propósito

Greedy toma decisiones locales según un criterio. Generalmente es más rápido que una búsqueda exhaustiva, pero no garantiza encontrar una solución aunque exista ni garantiza optimalidad global.

## Estrategia

1. Generar las sesiones.
2. Generar candidatos para cada sesión.
3. Contar los candidatos de cada sesión.
4. Ordenar primero las sesiones con menos candidatos.
5. Evaluar los candidatos de cada sesión en orden determinista.
6. Seleccionar el primer candidato que no viole restricciones duras.
7. Registrar la asignación.
8. Si no existe candidato válido, dejar la sesión pendiente.
9. Validar el resultado final y recopilar métricas.

## Pseudocódigo

```text
GREEDY(sesiones, candidatos):
    ordenar sesiones por cantidad ascendente de candidatos
    horario = vacío
    pendientes = vacío

    PARA cada sesion:
        asignada = falso

        PARA cada candidato de la sesion:
            SI candidato respeta restricciones frente al horario:
                agregar candidato al horario
                asignada = verdadero
                romper

        SI no asignada:
            agregar sesion a pendientes

    validar horario
    retornar horario, pendientes y métricas
```

## Complejidad

Definir:
- `N`: número de sesiones.
- `K`: máximo de candidatos por sesión.

Si el ordenamiento cuesta `O(N log N)` y cada candidato se valida en tiempo esperado constante con estructuras de ocupación adecuadas, la cota simplificada es:

```text
O(N log N + NK)
```

Si cada validación recorre todo el horario, el costo aumenta y debe incorporarse al análisis. El almacenamiento de candidatos puede alcanzar `O(NK)`, además del horario y las estructuras auxiliares.

# 12. Algoritmo Backtracking

## Propósito

Explora alternativas y retrocede cuando una asignación impide continuar. Si la búsqueda es exhaustiva y termina, puede encontrar una solución si existe o determinar que no existe dentro del modelo definido.

Si se detiene por tiempo o límite de nodos, debe informar `LIMIT_REACHED`, nunca afirmar que no existe solución.

## Estrategia

1. Generar sesiones y candidatos.
2. Ordenar sesiones por menor cantidad de candidatos.
3. Tomar la siguiente sesión.
4. Recorrer sus candidatos.
5. Comprobar restricciones duras.
6. Asignar temporalmente un candidato válido.
7. Llamar recursivamente para la siguiente sesión.
8. Si se encuentra solución, devolverla.
9. Si la rama fracasa, retirar la asignación y contar un retroceso.
10. Probar el siguiente candidato.
11. Si se agotan los candidatos, devolver fracaso al nivel anterior.

## Pseudocódigo

```text
BACKTRACKING(indice, sesiones, horario):
    SI indice == cantidad de sesiones:
        retornar verdadero

    sesion = sesiones[indice]

    PARA cada candidato de candidatos[sesion]:
        aumentar nodos visitados

        SI candidato respeta restricciones:
            asignar candidato

            SI BACKTRACKING(indice + 1, sesiones, horario):
                retornar verdadero

            retirar candidato
            aumentar retrocesos

    retornar falso
```

## Poda

- Ordenar primero las sesiones más restringidas.
- No explorar candidatos que violen restricciones duras.
- Detectar sesiones sin candidatos.
- Utilizar estructuras eficientes para consultar ocupación.
- Permitir límites de tiempo o nodos, registrándolos.

La poda debe ser segura: no debe descartar una rama que podría contener una solución válida, salvo que se documente explícitamente que se utiliza una heurística que sacrifica exhaustividad.

## Complejidad

Con `N` sesiones y hasta `K` candidatos por sesión, una cota simplificada del árbol de búsqueda es `O(K^N)` en el peor caso, multiplicada por el costo de comprobar restricciones por nodo. La pila recursiva requiere `O(N)` espacio, sin contar candidatos, horario y estructuras auxiliares.

El comportamiento real depende de las restricciones, el orden de candidatos y la poda. No afirmar que Backtracking siempre será más lento en toda instancia.

# 13. Validador independiente

El validador debe recibir un horario y devolver una lista estructurada de conflictos. No debe estar implementado únicamente dentro de Greedy o Backtracking.

Debe comprobar:
1. Cruces por docente.
2. Cruces por grupo.
3. Disponibilidad docente.
4. Día permitido.
5. Límites de jornada.
6. Duración correcta.
7. Cantidad de sesiones requerida.
8. Suma de minutos semanales por asignación.
9. Sesiones duplicadas.
10. Integridad de referencias.

Ejemplo de conflicto:

```json
{
  "type": "TEACHER_OVERLAP",
  "message": "El docente tiene dos clases simultáneas.",
  "sessionIds": ["sesion-1", "sesion-2"],
  "dayOfWeek": 1
}
```

Tipos sugeridos:
- `TEACHER_OVERLAP`
- `GROUP_OVERLAP`
- `TEACHER_UNAVAILABLE`
- `OUTSIDE_WORKING_HOURS`
- `INVALID_DURATION`
- `MISSING_SESSION`
- `DUPLICATE_SESSION`
- `WEEKLY_MINUTES_MISMATCH`

Debe ser determinista y tener pruebas unitarias para cada regla.

# 14. Calidad y optimización

Distinguir tres conceptos:

- **Factibilidad:** cumple todas las restricciones duras.
- **Calidad:** conveniencia según preferencias y función objetivo.
- **Optimalidad:** se demuestra que no existe una solución admisible mejor según la función objetivo.

Se puede diseñar una puntuación basada en huecos, distribución diaria y preferencias horarias. Los pesos deben documentarse y ambos algoritmos deben usar la misma función para comparar calidad.

Greedy puede usar criterios locales para ordenar candidatos. Backtracking puede detenerse en la primera solución factible o explorar para buscar una de mejor puntuación. Son objetivos diferentes y deben identificarse.

# 15. Métricas y experimentos

## Métricas

- Tiempo de ejecución en milisegundos.
- Operaciones, con definición explícita de qué cuenta como operación.
- Sesiones requeridas.
- Sesiones asignadas.
- Sesiones pendientes.
- Conflictos detectados.
- Nodos visitados.
- Retrocesos.
- Puntuación de calidad.
- Memoria, solo si se mide o estima con metodología documentada.

No comparar contadores distintos como si fueran equivalentes. Nodos visitados por Backtracking no equivalen directamente a comparaciones de Greedy.

## Metodología

1. Preparar instancias pequeñas, medianas y grandes.
2. Ejecutar ambos algoritmos con los mismos datos.
3. Usar las mismas restricciones y configuración.
4. Guardar versión del código e instantánea de entrada.
5. Repetir ejecuciones cuando corresponda.
6. Calcular promedio y mediana de tiempo.
7. Comparar validez, sesiones asignadas, calidad y métricas.
8. Analizar casos donde los algoritmos se comporten diferente.
9. Completar tablas del informe únicamente con mediciones reales.

## Estados de ejecución

- `COMPLETED`: el procedimiento terminó; revisar si quedaron sesiones pendientes.
- `NO_SOLUTION`: búsqueda exhaustiva determinó que no hay solución en el modelo.
- `LIMIT_REACHED`: límite de tiempo o nodos alcanzado sin concluir.
- `ERROR`: error técnico.
- `PENDING` y `RUNNING`: estados intermedios.

Greedy puede finalizar `COMPLETED` con sesiones pendientes, informando que el resultado es parcial. No usar `NO_SOLUTION` para una heurística que no demuestra inexistencia de solución.

# 16. Módulos funcionales

## Períodos académicos
Crear, editar, consultar, activar y cerrar períodos; consultar asignaciones y ejecuciones.

## Docentes
Registrar, editar, consultar, activar o desactivar docentes; consultar su disponibilidad y asignaciones.

## Asignaturas
Registrar, editar, consultar, activar o desactivar materias.

## Grupos
Registrar, editar, consultar, activar o desactivar grupos.

## Asignaciones académicas
Seleccionar período, asignatura, docente y grupo; definir minutos semanales y requerimientos; validar la suma de sesiones.

## Disponibilidad
Definir intervalos por día; validar rangos y consultar disponibilidad semanal.

## Generación de horarios
Seleccionar período y algoritmo; configurar jornada y cuadrícula; ejecutar planificación; mostrar estado, horario, pendientes y conflictos.

## Analítica
Comparar ejecuciones con la misma instantánea; mostrar tiempo, operaciones, nodos, retrocesos, sesiones, conflictos y calidad.

## Calendario
Mostrar horario semanal con asignatura, docente, grupo, día e intervalo; consultar detalles e identificar pendientes o conflictos.

# 17. API REST propuesta

Los endpoints son una propuesta inicial y deben implementarse progresivamente.

```http
GET    /api/teachers
GET    /api/teachers/:id
POST   /api/teachers
PUT    /api/teachers/:id
PATCH  /api/teachers/:id/status

GET    /api/subjects
GET    /api/subjects/:id
POST   /api/subjects
PUT    /api/subjects/:id
PATCH  /api/subjects/:id/status

GET    /api/groups
GET    /api/groups/:id
POST   /api/groups
PUT    /api/groups/:id
PATCH  /api/groups/:id/status

GET    /api/periods
POST   /api/periods
GET    /api/periods/:id
PUT    /api/periods/:id

GET    /api/assignments
POST   /api/assignments
GET    /api/assignments/:id
PUT    /api/assignments/:id

GET    /api/teachers/:id/availability
POST   /api/teachers/:id/availability
PUT    /api/availability/:id
DELETE /api/availability/:id

POST   /api/scheduling/greedy
POST   /api/scheduling/backtracking
GET    /api/scheduling/runs/:id
GET    /api/scheduling/runs/:id/sessions
GET    /api/scheduling/periods/:periodId/runs

GET    /api/analytics/runs/:id
GET    /api/analytics/compare?runA=:id&runB=:id
```

Aunque la tabla se llama `student_groups`, la ruta puede llamarse `/api/groups`.

La comparación solo es justa si ambas ejecuciones utilizan la misma instantánea, restricciones y configuración comparable.

# 18. Clean Code y buenas prácticas

## Responsabilidad única
- Controlador: HTTP.
- Servicio: coordina casos de uso.
- Repositorio: persistencia.
- Motor: planificación.
- Validador: restricciones.

No colocar consultas Prisma dentro de Greedy.

## Nombres claros
Preferir `generarSesiones`, `validarDisponibilidadDocente`, `detectarCrucesDeHorario` y `calcularMinutosSemanales`. Evitar `hacer`, `procesar2`, `datoX` o `funcion1`.

## Funciones pequeñas
Una función debe tener una responsabilidad. Dividir funciones que generen sesiones, validen, persistan y respondan HTTP en una sola operación.

## Tipado estricto
- Evitar `any`.
- Definir interfaces y tipos del dominio.
- Validar datos externos.
- Separar tipos de entrada, dominio y respuesta HTTP.
- Modelar estados y algoritmos con tipos o enumeraciones.

## Validación
Validar identificadores, duraciones positivas, minutos entre 0 y 1440, fin posterior al inicio, días válidos, minutos semanales, suma de sesiones, disponibilidad y relaciones. El backend siempre debe volver a validar los datos recibidos.

## Errores
- Middleware centralizado.
- Errores de dominio tipados.
- Códigos HTTP adecuados.
- No enviar trazas internas al cliente.
- Registrar detalles técnicos en servidor.

## Transacciones
Al guardar una ejecución, guardar registro, sesiones, métricas y estado de forma coherente. Ejecutar primero el motor en memoria y persistir después; no mantener innecesariamente una transacción abierta durante una búsqueda larga.

## Seguridad
- Variables sensibles en `.env`.
- `.env` dentro de `.gitignore`.
- Validar y limitar solicitudes.
- No confiar en identificadores del navegador.
- No mostrar errores internos.
- Utilizar Prisma para consultas parametrizadas.
- No registrar contraseñas.

Autenticación puede quedar fuera del primer prototipo si no es necesaria para la evaluación, pero debe documentarse como limitación.

## Pruebas y estilo
- Pruebas unitarias de reglas, generadores y algoritmos.
- Pruebas de servicios y endpoints.
- Pruebas de integración con MySQL.
- TypeScript `strict`.
- ESLint y Prettier cuando se configuren.
- Evitar duplicación, dependencias circulares y abstracciones innecesarias.

# 19. Pruebas mínimas

1. Una sesión con disponibilidad debe poder asignarse.
2. Dos sesiones simultáneas del mismo docente deben generar conflicto.
3. Dos sesiones simultáneas del mismo grupo deben generar conflicto.
4. Dos sesiones consecutivas deben permitirse.
5. Una sesión fuera de disponibilidad debe rechazarse.
6. Una sesión fuera de jornada debe rechazarse.
7. Una asignación cuya suma de sesiones no coincide con los minutos semanales debe rechazarse antes de planificar.
8. Una sesión sin candidatos debe reportarse.
9. Backtracking exhaustivo debe encontrar una solución si existe.
10. Backtracking debe concluir `NO_SOLUTION` solo después de búsqueda exhaustiva.
11. Una búsqueda interrumpida debe informar `LIMIT_REACHED`.
12. El validador debe detectar conflictos aunque el algoritmo no los haya generado.

Probar también inicios y finales exactamente en los límites de disponibilidad y jornada.

# 20. Plan de desarrollo por fases

## Fase 1. Preparación
Inspeccionar repositorio, versiones, MySQL y nueve tablas. Configurar TypeScript, Express, Prisma y Vitest. Ejecutar `prisma db pull` y `prisma generate`. Probar una consulta real.

**Salida:** servidor funcionando y consulta a MySQL.

## Fase 2. Modelos y persistencia
Revisar modelos Prisma, crear tipos de dominio y repositorios, probar lectura y escritura.

**Salida:** persistencia funcional sin acoplar el motor a Prisma.

## Fase 3. CRUD
Implementar períodos, docentes, asignaturas, grupos, asignaciones y disponibilidad.

**Salida:** endpoints probados e integridad verificada.

## Fase 4. Motor base
Crear modelos puros, generador de sesiones, generador de candidatos y validador.

**Salida:** motor que trabaja en memoria sin base de datos.

## Fase 5. Greedy
Implementar ordenamiento, evaluación, asignación, pendientes y métricas.

**Salida:** resultados reproducibles y validados.

## Fase 6. Backtracking
Implementar recursión, asignación/desasignación, poda segura, límites y métricas.

**Salida:** pruebas de solución, ausencia de solución y límite alcanzado.

## Fase 7. Integración
Crear servicios, instantáneas, endpoints, persistencia y consultas históricas.

**Salida:** ejecución desde API y consulta posterior.

## Fase 8. Experimentos
Crear datasets de varios tamaños, ejecutar ambos algoritmos, medir y analizar.

**Salida:** resultados reproducibles y metodología documentada.

## Fase 9. Frontend
Crear Next.js, formularios, administración, generación, calendario y gráficos.

**Salida:** interfaz conectada al backend.

## Fase 10. Cierre
Pruebas integrales, documentación, análisis de complejidad, limitaciones y defensa.

**Salida:** prototipo y documentación académica verificables.

# 21. Datos ficticios de prueba

| Asignatura | Docente | Grupo | Minutos semanales | División |
|---|---|---|---:|---|
| Programación I | Docente A | 1INF-A | 240 | 2 × 120 |
| Matemática | Docente B | 1INF-A | 180 | 1 × 180 |
| Base de Datos | Docente C | 1INF-A | 120 | 1 × 120 |
| Programación II | Docente A | 2INF-A | 240 | 2 × 120 |

La disponibilidad ilustrativa es lunes a viernes de 07:00 a 18:00. Estos datos son ficticios y no representan horarios reales de una institución.

# 22. Decisiones técnicas que deben respetarse

1. El motor es TypeScript independiente de la infraestructura.
2. El tiempo se representa en minutos desde medianoche.
3. Los días usan una convención única de 1 a 7.
4. Las sesiones se generan desde los requerimientos.
5. La duración de sesión no tiene que ser igual a la cuadrícula.
6. El validador es independiente de los algoritmos.
7. Ambos algoritmos reciben entradas equivalentes.
8. Cada ejecución conserva instantánea y métricas.
9. Greedy no garantiza solución ni optimalidad global.
10. Backtracking solo afirma ausencia de solución si termina exhaustivamente.
11. Los límites de búsqueda se registran.
12. No se validan conflictos de aulas en la primera versión.
13. Los datos de demostración son ficticios.
14. Los cambios de esquema requieren migraciones controladas y respaldo.

# 23. Cómo debe responder la IA en cada etapa

Al continuar el desarrollo, utiliza esta estructura:

1. **Paso actual:** etapa en la que estamos.
2. **Objetivo:** qué se construirá.
3. **Archivos:** archivos que se crearán o modificarán.
4. **Código:** contenido completo de los archivos necesarios.
5. **Explicación:** responsabilidad y decisiones de cada archivo.
6. **Comandos:** comandos exactos para Windows/PowerShell.
7. **Pruebas:** cómo comprobar el funcionamiento.
8. **Resultado esperado:** salida o comportamiento esperado.
9. **Siguiente paso:** solamente la etapa inmediata.

No avanzar hasta que el usuario confirme que la etapa funciona o se hayan revisado los errores. Si el usuario comparte un error, analizar el mensaje exacto, revisar el archivo relevante y proponer la corrección mínima.

# 24. Glosario

- **Greedy:** estrategia que elige una opción local en cada paso.
- **Backtracking:** búsqueda que explora alternativas y retrocede.
- **Complejidad temporal:** crecimiento del tiempo según el tamaño de entrada.
- **Complejidad espacial:** crecimiento de memoria necesaria.
- **Poda:** descartar ramas que no pueden producir una solución válida bajo una condición segura.
- **Candidato:** posible ubicación de una sesión.
- **Factibilidad:** cumplimiento de restricciones obligatorias.
- **Función objetivo:** fórmula para evaluar soluciones.
- **Instantánea:** copia de datos y parámetros utilizados en una ejecución.
- **Operación contabilizada:** acción definida por la metodología experimental para construir un contador.

# 25. Resumen ejecutivo para copiar a otra IA

Estoy desarrollando un sistema web académico de asignación automática de horarios. La base MySQL `academic_scheduler` ya existe y contiene nueve tablas: `academic_periods`, `teachers`, `student_groups`, `subjects`, `course_assignments`, `session_requirements`, `teacher_availability`, `schedule_runs` y `schedule_sessions`.

La aplicación administrará períodos, docentes, grupos, asignaturas, asignaciones académicas, requerimientos de sesiones y disponibilidad. Su función central será generar horarios sin cruces de docentes ni grupos, respetando disponibilidad y minutos semanales.

El núcleo académico implementará Greedy y Backtracking, independientes de la infraestructura. Un validador separado comprobará restricciones duras. Se medirán tiempo, operaciones definidas, sesiones asignadas y pendientes, conflictos, nodos y retrocesos. Cada ejecución guardará una instantánea de entrada para permitir comparaciones reproducibles.

El backend utilizará Node.js, TypeScript, Express, Prisma y MySQL. Las pruebas se harán con Vitest. El frontend se desarrollará posteriormente con Next.js, React, Tailwind, FullCalendar y Recharts.

Desarrolla paso a paso, revisa el repositorio y la base de datos antes de modificarlos, aplica Clean Code, no inventes datos ni resultados, explica cada archivo y no te saltes etapas. El motor debe permanecer desacoplado de Express, Prisma, MySQL y React.
