import { Router } from "express";
import path from "path";

const root = process.cwd();

const router = Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(root, 'public', 'index.html'));
});
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(root, 'public', 'dashboard.html'));
});
router.get('/banner', (req, res) => {
    res.sendFile(path.join(root, 'public', 'banners', 'index.html'));
});
router.get('/banner/create', (req, res) => {
    res.sendFile(path.join(root, 'public', 'banners', 'create.html'));
});
router.get('/banner/edit', (req, res) => {
    res.sendFile(path.join(root, 'public', 'banners', 'edit.html'));
});

router.get('/countries', (req, res) => {
    res.sendFile(path.join(root, 'public', 'countries', 'index.html'));
});

router.get('/employees', (req, res) => {
    res.sendFile(path.join(root, 'public', 'employees', 'index.html'));
});

router.get('/employees/create', (req, res) => {
    res.sendFile(path.join(root, 'public', 'employees', 'create.html'));
});

router.get('/employees/edit', (req, res) => {
    res.sendFile(path.join(root, 'public', 'employees', 'edit.html'));
});

router.get('/patients', (req, res) => {
    res.sendFile(path.join(root, 'public', 'patients', 'index.html'));
});

router.get('/profile', (req, res) => {
    res.sendFile(path.join(root, 'public', 'profile', 'index.html'));
});

router.get('/reservations', (req, res) => {
    res.sendFile(path.join(root, 'public', 'reservations', 'index.html'));
});

router.get('/schedules', (req, res) => {
    res.sendFile(path.join(root, 'public', 'schedules', 'index.html'));
});

router.get('/specializations', (req, res) => {
    res.sendFile(path.join(root, 'public', 'specializations', 'index.html'));
});
router.get('/specializations/create', (req, res) => {
    res.sendFile(path.join(root, 'public', 'specializations', 'create.html'));
});
router.get('/specializations/edit', (req, res) => {
    res.sendFile(path.join(root, 'public', 'specializations', 'edit.html'));
});




export {router as frontendRoutes};