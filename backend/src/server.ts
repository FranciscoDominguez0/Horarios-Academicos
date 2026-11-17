
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { prisma } from "./config/database.js";
import { enrutadorPeriodos } from "./modules/periods/rutas-periodos.js";
import { enrutadorDocentes } from "./modules/teachers/rutas-docentes.js";
import { enrutadorMaterias } from "./modules/subjects/rutas-materias.js";
import { enrutadorGrupos } from "./modules/groups/rutas-grupos.js";
import { enrutadorAsignaciones } from "./modules/assignments/rutas-asignaciones.js";
import { enrutadorPlanificacion } from "./modules/scheduling/rutas-planificacion.js";
import { enrutadorAnalitica } from "./modules/analytics/rutas-analitica.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/periods", enrutadorPeriodos);
app.use("/api/teachers", enrutadorDocentes);
app.use("/api/subjects", enrutadorMaterias);
app.use("/api/groups", enrutadorGrupos);
app.use("/api/assignments", enrutadorAsignaciones);
app.use("/api/scheduling", enrutadorPlanificacion);
app.use("/api/analytics", enrutadorAnalitica);

app.get("/", (req, res) => {
    res.json({
        message: "API del Sistema de Asignación de Horarios"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        await prisma.$connect();

        const teachers = await prisma.teachers.findMany();

        res.json({
            message: "Conexión a MySQL exitosa",
            totalTeachers: teachers.length,
            teachers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error al conectar con la base de datos"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});