using Microsoft.EntityFrameworkCore;

namespace ServiceCrmApi.Models
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext db)
        {
            if (db.Users.Any()) return;

            var users = new[]
            {
                new User { Name = "admin", Phone = "+375291234567", Email = "admin@example.com",
                    PasswordHash = "$2a$12$5Pgjk/.M5jZzjwB8TWA4zeHM.Wuh/46Yupi9BCFrk053WMseXXj3K",
                    Role = UserRole.Admin, Specialization = "Руководитель", Comission_percent = 5,
                    CreatedAt = new DateTime(2026, 1, 10, 9, 0, 0, DateTimeKind.Utc) },
                new User { Name = "Алексей Смирнов", Phone = "+375292345678", Email = "alexey@example.com",
                    PasswordHash = "$2b$10$23wme7QwINL0oFF9tCwQZObaw40A4WfglJ2OdzochmmTnIFwEHyHK",
                    Role = UserRole.Master, Specialization = "Ремонт телефонов", Comission_percent = 10,
                    CreatedAt = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc) },
                new User { Name = "Дмитрий Иванов", Phone = "+375293456789", Email = "dmitry@example.com",
                    PasswordHash = "$2b$10$/vJT.hOuW4uD5FBosEbiGukPkEHoNFhVN7YX/vP9uhiqnDtkf3.fi",
                    Role = UserRole.Manager, Comission_percent = 8,
                    CreatedAt = new DateTime(2026, 2, 1, 11, 0, 0, DateTimeKind.Utc) },
                new User { Name = "Елена Козлова", Phone = "+375294567890", Email = "elena@example.com",
                    PasswordHash = "$2b$10$23wme7QwINL0oFF9tCwQZObaw40A4WfglJ2OdzochmmTnIFwEHyHK",
                    Role = UserRole.Master, Specialization = "Ремонт ноутбуков", Comission_percent = 10,
                    CreatedAt = new DateTime(2026, 2, 10, 12, 0, 0, DateTimeKind.Utc) },
                new User { Name = "Сергей Новиков", Phone = "+375295678901", Email = "sergey@example.com",
                    PasswordHash = "$2b$10$23wme7QwINL0oFF9tCwQZObaw40A4WfglJ2OdzochmmTnIFwEHyHK",
                    Role = UserRole.Master, Specialization = "Ремонт планшетов", Comission_percent = 10,
                    CreatedAt = new DateTime(2026, 3, 1, 9, 0, 0, DateTimeKind.Utc) },
            };
            db.Users.AddRange(users);
            db.SaveChanges();

            var clients = new[]
            {
                new Client { Name = @"ООО ""ТехноСервис""", Phone = "+375171111111", Email = "info@tn-service.by",
                    Comment = "Корпоративный клиент, скидка 5%", CreatedAt = new DateTime(2026, 1, 20, 10, 0, 0, DateTimeKind.Utc) },
                new Client { Name = @"ИП Сидоров А.В.", Phone = "+375291111122", Email = "sidorov@mail.by",
                    Comment = "Постоянный клиент", CreatedAt = new DateTime(2026, 2, 5, 11, 30, 0, DateTimeKind.Utc) },
                new Client { Name = "Петрова Анна Игоревна", Phone = "+375331111133",
                    Comment = "Рекомендовала знакомых", CreatedAt = new DateTime(2026, 2, 15, 14, 0, 0, DateTimeKind.Utc) },
                new Client { Name = "Кузнецов Максим Олегович", Phone = "+375441111144", Email = "kuznetsov@gmail.com",
                    CreatedAt = new DateTime(2026, 3, 1, 15, 0, 0, DateTimeKind.Utc) },
                new Client { Name = "Иванова Елена Викторовна", Phone = "+375251111155",
                    Comment = "Ко мне", CreatedAt = new DateTime(2026, 3, 10, 16, 0, 0, DateTimeKind.Utc) },
                new Client { Name = @"ООО ""БизнесСофт""", Phone = "+375172222222", Email = "support@bsoft.by",
                    Comment = "Обслуживание офисной техники", CreatedAt = new DateTime(2026, 3, 15, 9, 0, 0, DateTimeKind.Utc) },
                new Client { Name = "Козлов Артём Денисович", Phone = "+375291111166", Email = "artem.kozlov@yandex.by",
                    CreatedAt = new DateTime(2026, 4, 1, 10, 0, 0, DateTimeKind.Utc) },
                new Client { Name = "Морозова Светлана Павловна", Phone = "+375331111177",
                    Comment = "VIP-клиент", CreatedAt = new DateTime(2026, 4, 10, 11, 0, 0, DateTimeKind.Utc) },
                new Client { Name = @"ЗАО ""СтройИнвест""", Phone = "+375173333333", Email = "office@stroi-inv.by",
                    CreatedAt = new DateTime(2026, 4, 20, 9, 30, 0, DateTimeKind.Utc) },
                new Client { Name = "Григорьев Павел Андреевич", Phone = "+375251111188", Email = "pavel.g@bk.ru",
                    Comment = "Знакомый директора", CreatedAt = new DateTime(2026, 5, 1, 12, 0, 0, DateTimeKind.Utc) },
            };
            db.Clients.AddRange(clients);
            db.SaveChanges();

            var warehouses = new[]
            {
                new Warehouse { Name = "Основной склад", Address = "г. Минск, ул. Промышленная, 15", UserId = 1 },
                new Warehouse { Name = "Дополнительный склад", Address = "г. Минск, ул. Заводская, 8", UserId = 1 },
            };
            db.Warehouses.AddRange(warehouses);
            db.SaveChanges();

            var products = new[]
            {
                new Product { Name = "Дисплей iPhone 12", Quantity = 15, WarehouseId = 1 },
                new Product { Name = "Аккумулятор iPhone 12", Quantity = 20, WarehouseId = 1 },
                new Product { Name = "Дисплей iPhone 13", Quantity = 10, WarehouseId = 1 },
                new Product { Name = "Шлейф зарядки iPhone X", Quantity = 30, WarehouseId = 1 },
                new Product { Name = "Стекло защитное универсальное", Quantity = 100, WarehouseId = 1 },
                new Product { Name = "Кабель Type-C 1м", Quantity = 50, WarehouseId = 1 },
                new Product { Name = "Блок питания 20W", Quantity = 25, WarehouseId = 1 },
                new Product { Name = "Дисплей Samsung Galaxy S21", Quantity = 8, WarehouseId = 1 },
                new Product { Name = "Аккумулятор Samsung Galaxy S21", Quantity = 12, WarehouseId = 1 },
                new Product { Name = "Корпус задний iPhone 12", Quantity = 10, WarehouseId = 1 },
                new Product { Name = "Дисплей iPad 9.7", Quantity = 5, WarehouseId = 2 },
                new Product { Name = "Аккумулятор для ноутбука Lenovo", Quantity = 7, WarehouseId = 2 },
                new Product { Name = "Термопаста Arctic MX-4", Quantity = 40, WarehouseId = 2 },
                new Product { Name = "Кулер для ноутбука", Quantity = 15, WarehouseId = 2 },
                new Product { Name = "Разъём зарядки Type-C (B2B)", Quantity = 25, WarehouseId = 1 },
                new Product { Name = "Микрофон для гарнитуры", Quantity = 20, WarehouseId = 2 },
                new Product { Name = "Шлейф дисплея Xiaomi Mi 11", Quantity = 10, WarehouseId = 1 },
                new Product { Name = "Кнопка включения Samsung A52", Quantity = 15, WarehouseId = 1 },
            };
            db.Products.AddRange(products);
            db.SaveChanges();

            var orders = new[]
            {
                new Order { ClientId = 1, Device = "iPhone 12", Serial = "IMEI12345678901", Issue = "Не включается после падения", Diagnosis = "Заменить дисплей и шлейф кнопки включения", Priority = OrderPriority.High, Status = "Issued", UserId = 2, Cost = 189m, Paid = 189m, Comment = "Срочный ремонт для офиса", CreatedAt = new DateTime(2026, 4, 10, 10, 0, 0, DateTimeKind.Utc), CompletedAt = new DateTime(2026, 4, 12, 16, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 2, Device = "Samsung Galaxy S21", Serial = "RZKM8045678", Issue = "Разбит экран, не реагирует на касания", Diagnosis = "Требуется замена дисплея и стекла", Priority = OrderPriority.Normal, Status = "Ready", UserId = 2, Cost = 245m, Paid = 245m, CreatedAt = new DateTime(2026, 4, 15, 11, 30, 0, DateTimeKind.Utc), CompletedAt = new DateTime(2026, 4, 18, 14, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 3, Device = "iPhone 13", Serial = "IMEI98765432101", Issue = "Быстро разряжается, греется", Diagnosis = "Дефектный аккумулятор, замена", Priority = OrderPriority.VIP, Status = "Repair", UserId = 2, Cost = 79m, Paid = 50m, Comment = "VIP-клиент, сделать за 1 день", CreatedAt = new DateTime(2026, 4, 20, 9, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 4, Device = "MacBook Pro 14\"", Serial = "MBP2026A1234", Issue = "Не загружается macOS", Priority = OrderPriority.Normal, Status = "New", Cost = 150m, CreatedAt = new DateTime(2026, 5, 1, 14, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 5, Device = "iPhone 11", Serial = "IMEI55555555555", Issue = "Не работает Face ID", Priority = OrderPriority.Normal, Status = "Diagnostics", UserId = 4, Cost = 65m, Comment = "Проверить камеру тоже", CreatedAt = new DateTime(2026, 5, 5, 10, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 6, Device = "Ноутбук Lenovo ThinkPad X1", Serial = "LP2025C789", Issue = "Греется, выключается через 5 минут", Diagnosis = "Требуется замена термопасты и чистка кулера", Priority = OrderPriority.High, Status = "Repair", UserId = 4, Cost = 95m, Paid = 95m, Comment = "Корпоративный заказ, срочно", CreatedAt = new DateTime(2026, 5, 7, 8, 30, 0, DateTimeKind.Utc) },
                new Order { ClientId = 7, Device = "iPad 9.7", Serial = "IPAD2024G5678", Issue = "Разбит дисплей", Diagnosis = "Замена дисплея", Priority = OrderPriority.Normal, Status = "Ready", UserId = 5, Cost = 120m, Paid = 120m, CreatedAt = new DateTime(2026, 5, 8, 12, 0, 0, DateTimeKind.Utc), CompletedAt = new DateTime(2026, 5, 11, 11, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 8, Device = "Xiaomi Mi 11", Serial = "XML9876123456", Issue = "Не видит SIM-карту", Priority = OrderPriority.VIP, Status = "New", Cost = 45m, Comment = "VIP", CreatedAt = new DateTime(2026, 5, 12, 15, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 9, Device = "Принтер HP LaserJet", Serial = "HPLJ1234567", Issue = "Не печатает, ошибка бумаги", Priority = OrderPriority.Normal, Status = "Diagnostics", UserId = 4, Cost = 50m, Comment = "Офисный принтер", CreatedAt = new DateTime(2026, 5, 13, 9, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 2, Device = "Samsung Galaxy A52", Serial = "SM-A525F-12345", Issue = "Не заряжается", Diagnosis = "Замена разъёма зарядки", Priority = OrderPriority.Normal, Status = "Issued", UserId = 2, Cost = 55m, Paid = 55m, Comment = "Сделано", CreatedAt = new DateTime(2026, 5, 10, 13, 0, 0, DateTimeKind.Utc), CompletedAt = new DateTime(2026, 5, 11, 16, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 10, Device = "iPhone 12 Pro", Serial = "IMEI77777777777", Issue = "Сброс приложений, зависает", Diagnosis = "Перепрошивка, диагностика контроллера питания", Priority = OrderPriority.High, Status = "Repair", UserId = 2, Cost = 120m, Paid = 60m, Comment = "Клиент торопит", CreatedAt = new DateTime(2026, 5, 14, 16, 0, 0, DateTimeKind.Utc) },
                new Order { ClientId = 1, Device = "Монитор Dell 27\"", Serial = "DELL27654321", Issue = "Мерцает экран", Priority = OrderPriority.Normal, Status = "New", Cost = 80m, Comment = "По гарантии", CreatedAt = new DateTime(2026, 5, 15, 10, 0, 0, DateTimeKind.Utc) },
            };
            db.Orders.AddRange(orders);
            db.SaveChanges();

            var settings = new[]
            {
                new Setting { KeyName = "company_name", Value = "ServiceCRM", Description = "Название компании" },
                new Setting { KeyName = "company_address", Value = "г. Минск, ул. Советская, 10", Description = "Адрес компании" },
                new Setting { KeyName = "company_phone", Value = "+375291234567", Description = "Телефон компании" },
                new Setting { KeyName = "default_commission", Value = "10", Description = "Комиссия мастера по умолчанию" },
                new Setting { KeyName = "currency", Value = "Byn", Description = "Валюта" },
            };
            db.Settings.AddRange(settings);
            db.SaveChanges();

            var transactions = new[]
            {
                new Transaction { Type = TransactionType.Income, Amount = 189m, Category = "Оплата заказа", OrderId = 1, Description = "Полная оплата заказа №1", CreatedAt = new DateTime(2026, 4, 12, 16, 0, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 245m, Category = "Оплата заказа", OrderId = 2, Description = "Полная оплата заказа №2", CreatedAt = new DateTime(2026, 4, 18, 14, 0, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 50m, Category = "Предоплата", OrderId = 3, Description = "Предоплата 50% заказа №3", CreatedAt = new DateTime(2026, 4, 20, 9, 0, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 95m, Category = "Оплата заказа", OrderId = 6, Description = "Полная оплата заказа №6", CreatedAt = new DateTime(2026, 5, 7, 8, 30, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 120m, Category = "Оплата заказа", OrderId = 7, Description = "Полная оплата заказа №7", CreatedAt = new DateTime(2026, 5, 11, 11, 0, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 55m, Category = "Оплата заказа", OrderId = 10, Description = "Полная оплата заказа №10", CreatedAt = new DateTime(2026, 5, 11, 16, 0, 0, DateTimeKind.Utc) },
                new Transaction { Type = TransactionType.Income, Amount = 60m, Category = "Предоплата", OrderId = 11, Description = "Предоплата 50% заказа №11", CreatedAt = new DateTime(2026, 5, 14, 16, 0, 0, DateTimeKind.Utc) },
            };
            db.Transactions.AddRange(transactions);
            db.SaveChanges();

            var logs = new[]
            {
                new ActivityLog { UserId = 1, UserName = "admin", Action = "Create", EntityType = "User", EntityId = 2, Details = "Создан пользователь: Алексей Смирнов", CreatedAt = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 1, UserName = "admin", Action = "Create", EntityType = "User", EntityId = 3, Details = "Создан пользователь: Дмитрий Иванов", CreatedAt = new DateTime(2026, 2, 1, 11, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 2, UserName = "Алексей Смирнов", Action = "Create", EntityType = "Order", EntityId = 1, Details = "Создан заказ #1: iPhone 12", CreatedAt = new DateTime(2026, 4, 10, 10, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 2, UserName = "Алексей Смирнов", Action = "Update", EntityType = "Order", EntityId = 1, Details = "Обновлён заказ #1: статус -> Issued", CreatedAt = new DateTime(2026, 4, 12, 16, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 2, UserName = "Алексей Смирнов", Action = "Create", EntityType = "Order", EntityId = 2, Details = "Создан заказ #2: Samsung Galaxy S21", CreatedAt = new DateTime(2026, 4, 15, 11, 30, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 2, UserName = "Алексей Смирнов", Action = "Update", EntityType = "Order", EntityId = 2, Details = "Обновлён заказ #2: статус -> Ready", CreatedAt = new DateTime(2026, 4, 18, 14, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 2, UserName = "Алексей Смирнов", Action = "Create", EntityType = "Order", EntityId = 3, Details = "Создан заказ #3: iPhone 13", CreatedAt = new DateTime(2026, 4, 20, 9, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 4, UserName = "Елена Козлова", Action = "Create", EntityType = "Order", EntityId = 5, Details = "Создан заказ #5: iPhone 11", CreatedAt = new DateTime(2026, 5, 5, 10, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 4, UserName = "Елена Козлова", Action = "Create", EntityType = "Order", EntityId = 6, Details = "Создан заказ #6: Lenovo ThinkPad X1", CreatedAt = new DateTime(2026, 5, 7, 8, 30, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 5, UserName = "Сергей Новиков", Action = "Create", EntityType = "Order", EntityId = 7, Details = "Создан заказ #7: iPad 9.7", CreatedAt = new DateTime(2026, 5, 8, 12, 0, 0, DateTimeKind.Utc) },
                new ActivityLog { UserId = 1, UserName = "admin", Action = "Create", EntityType = "Warehouse", EntityId = 1, Details = "Создан склад: Основной склад", CreatedAt = new DateTime(2026, 1, 20, 9, 0, 0, DateTimeKind.Utc) },
            };
            db.ActivityLogs.AddRange(logs);
            db.SaveChanges();
        }
    }
}
