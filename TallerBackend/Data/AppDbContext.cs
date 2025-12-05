using Microsoft.EntityFrameworkCore;
using TallerBackend.Models;

namespace TallerBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Tablas del modelo
        public DbSet<Servicio> Servicios { get; set; }
        public DbSet<Cita> Citas { get; set; }
        public DbSet<Marca> Marcas { get; set; }
        public DbSet<Modelo> Modelos { get; set; }
        public DbSet<Anio> Anios { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Trabajador> Trabajadores { get; set; }
        public DbSet<EntradaTaller> EntradasTaller { get; set; }
        public DbSet<PlannerLog> PlannerLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Mapeo de tablas
            modelBuilder.Entity<Servicio>().ToTable("servicios");
            modelBuilder.Entity<Cita>().ToTable("citas");
            modelBuilder.Entity<Marca>().ToTable("marcas");
            modelBuilder.Entity<Modelo>().ToTable("modelos");
            modelBuilder.Entity<Anio>().ToTable("anios");
            modelBuilder.Entity<Usuario>().ToTable("usuarios");
            modelBuilder.Entity<Trabajador>().ToTable("trabajadores");
            modelBuilder.Entity<EntradaTaller>().ToTable("entradas_taller");
            modelBuilder.Entity<PlannerLog>().ToTable("planner_logs");

            // Propiedades especiales
            modelBuilder.Entity<Servicio>()
                .Property(s => s.Precio)
                .HasColumnType("decimal(18,2)");

            // Relaciones
            modelBuilder.Entity<Modelo>()
                .HasOne(m => m.Marca)
                .WithMany(m => m.Modelos)
                .HasForeignKey(m => m.IdMarca);

            modelBuilder.Entity<Anio>()
                .HasOne(a => a.Modelo)
                .WithMany()
                .HasForeignKey(a => a.IdModel);

            base.OnModelCreating(modelBuilder);
        }
    }
}
