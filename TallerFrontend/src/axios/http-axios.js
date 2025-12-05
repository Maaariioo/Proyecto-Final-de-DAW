import axios from 'axios';

const URL = 'http://100.26.173.76:5000/api';

export const httpServicios = axios.create({
  baseURL: `${URL}/Servicios`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpUsuarios = axios.create({
  baseURL: `${URL}/Usuarios`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpMarcas = axios.create({
  baseURL: `${URL}/Marcas`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpModelos = axios.create({
  baseURL: `${URL}/Modelos`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpAnios = axios.create({
  baseURL: `${URL}/Anios`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpCitas = axios.create({
  baseURL: `${URL}/Citas`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpTrabajadores = axios.create({
  baseURL: `${URL}/Trabajadores`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpEntradasTaller = axios.create({
  baseURL: `${URL}/EntradasTaller`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpPlannerLogs = axios.create({
  baseURL: `${URL}/PlannerLogs`,
  headers: { 'Content-Type': 'application/json' },
});

export const httpPayPal = axios.create({
  baseURL: `${URL}/paypal`,
  headers: { 'Content-Type': 'application/json' },
});