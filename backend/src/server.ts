
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { prisma } from "./config/database.js";
import { enrutadorPlanificacion } from "./modules/scheduling/rutas-planificacion.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/scheduling", enrutadorPlanificacion);

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