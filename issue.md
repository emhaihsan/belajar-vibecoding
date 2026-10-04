# Planning: API Logout User (DELETE /api/user/current)

## Tujuan

Menambahkan endpoint logout. Jika berhasil, row session dengan token tersebut **dihapus dari database** sehingga token tidak bisa dipakai lagi.

> Tidak ada perubahan database pada fitur ini — tabel `sessions` sudah ada.

## Struktur Folder

Gunakan struktur yang sudah ada:

- **`src/routes/users-route.ts`** — tambahkan route di file ini
- **`src/services/users-service.ts`** — tambahkan logic di file ini

Tanggung jawab tetap sama: routes hanya menerima request + validasi + memanggil service; semua business logic ada di services.

## Endpoint: `DELETE /api/user/current`

### Headers

```
Authorization: Bearer <token>
```

`<token>` adalah UUID dari tabel `sessions` yang diperoleh saat login.

### Request Body

Tidak ada / kosong.

### Response Success

```json
{
    "data": "OK"
}
```

Dan row `sessions` dengan token tersebut **harus terhapus dari database**.

### Response Error — tidak terautentikasi

```json
{
    "error": "Unauthorized"
}
```

Gunakan status code `401`. Pesan error ini dipakai untuk SEMUA kasus gagal: tanpa header, format `Bearer` salah, atau token tidak ditemukan di `sessions`.

## Langkah Implementasi

### 1. Implementasi service — `src/services/users-service.ts`

Tambahkan fungsi `logoutUser(token)` yang melakukan:

1. Cari row di tabel `sessions` berdasarkan `token`. Jika tidak ditemukan → return `{ error: "Unauthorized" }`.
2. Hapus row tersebut dengan `db.delete(sessions).where(eq(sessions.token, token))` (lihat pola query di fungsi `getCurrentUser` sebagai contoh penggunaan `eq` dan `sessions`).
3. Return `{ data: "OK" }`.

### 2. Implementasi route — `src/routes/users-route.ts`

Tambahkan route `DELETE /user/current` pada `usersRoute` yang sudah ada:

- Ekstrak token dari header `authorization` dengan format `Bearer <token>` — **pakai cara yang sama persis** seperti yang sudah dilakukan di route `POST /user/current`.
- Jika header tidak ada atau format salah → return `{ "error": "Unauthorized" }` dengan status 401.
- Panggil `logoutUser(token)`:
  - Sukses → return `{ "data": "OK" }`
  - Error → set status 401 dan return `{ "error": "Unauthorized" }`.

Route otomatis ter-expose sebagai `DELETE /api/user/current` karena `usersRoute` sudah di-mount dengan prefix `/api` — tidak perlu mengubah `src/index.ts`.

### 3. Verifikasi manual

Jalankan `bun run dev`, lalu tes:

```bash
# Login dulu untuk dapat token
TOKEN=$(curl -s -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ihsan@localhost","password":"rahasia"}' | jq -r '.data')

# Logout → expected: {"data":"OK"}
curl -X DELETE http://localhost:3000/api/user/current \
  -H "Authorization: Bearer $TOKEN"

# Logout ulang dengan token yang sama → expected: {"error":"Unauthorized"} (401)
curl -X DELETE http://localhost:3000/api/user/current \
  -H "Authorization: Bearer $TOKEN"

# Endpoint current user dengan token yang sudah dihapus → harus gagal juga
curl -X POST http://localhost:3000/api/user/current \
  -H "Authorization: Bearer $TOKEN"

# Tanpa header → expected: {"error":"Unauthorized"} (401)
curl -X DELETE http://localhost:3000/api/user/current
```

Cek juga di database bahwa row `sessions` dengan token tersebut sudah hilang (`SELECT * FROM sessions;`).

## Hal yang Perlu Diperhatikan

- Session **wajib dihapus dari database**, bukan sekadar mengembalikan response OK.
- Pesan error `Unauthorized` dipakai untuk semua kasus gagal.
- Ikuti konvensi penamaan file `*-route.ts` / `*-service.ts` yang sudah ada.
- Jangan commit file `.env`.
