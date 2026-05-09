<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Catégories ────────────────────────────────────────
        $categories = [
            ['name' => 'Développement Web', 'slug' => 'web',     'icon' => '🌐'],
            ['name' => 'Mobile',             'slug' => 'mobile',  'icon' => '📱'],
            ['name' => 'Data & IA',          'slug' => 'data',    'icon' => '🤖'],
            ['name' => 'Design',             'slug' => 'design',  'icon' => '🎨'],
            ['name' => 'Backend',            'slug' => 'backend', 'icon' => '⚙️'],
            ['name' => 'DevOps',             'slug' => 'devops',  'icon' => '☁️'],
        ];
        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // ── Admin ─────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'admin@xamxam.com'], [
            'name'     => 'Admin XamXam',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'country'  => 'Sénégal',
        ]);

        // ── Formateurs ────────────────────────────────────────
        $instructors = [
            ['name' => 'Mamadou Diallo',  'email' => 'mamadou@xamxam.com',  'country' => 'Sénégal'],
            ['name' => 'Fatou Sow',       'email' => 'fatou@xamxam.com',    'country' => 'Sénégal'],
            ['name' => 'Aïssatou Ba',     'email' => 'aissatou@xamxam.com', 'country' => 'Sénégal'],
        ];
        $instructorModels = [];
        foreach ($instructors as $inst) {
            $instructorModels[] = User::firstOrCreate(['email' => $inst['email']], [
                ...$inst,
                'password' => Hash::make('password'),
                'role'     => 'instructor',
                'bio'      => 'Formateur expert sur XamXam Tech.',
            ]);
        }

        // ── Apprenant demo ────────────────────────────────────
        $student = User::firstOrCreate(['email' => 'apprenant@xamxam.com'], [
            'name'     => 'Aminata Diallo',
            'password' => Hash::make('password'),
            'role'     => 'student',
            'country'  => 'Sénégal',
        ]);
        User::firstOrCreate(['email' => 'formateur@xamxam.com'], [
            'name'     => 'Ibrahima Ndiaye',
            'password' => Hash::make('password'),
            'role'     => 'instructor',
            'country'  => 'Sénégal',
        ]);

        // ── Cours ─────────────────────────────────────────────
        $webCat = Category::where('slug', 'web')->first();
        $course = Course::firstOrCreate(['slug' => 'reactjs-zero-a-expert'], [
            'instructor_id' => $instructorModels[0]->id,
            'category_id'   => $webCat->id,
            'title'         => 'React.js de Zéro à Expert',
            'description'   => 'Maîtrisez React.js de A à Z avec des projets concrets.',
            'level'         => 'Débutant',
            'price'         => 25000,
            'status'        => 'published',
            'rating'        => 4.9,
        ]);

        // ── Sections & Leçons ─────────────────────────────────
        $section = Section::firstOrCreate(
            ['course_id' => $course->id, 'title' => 'Introduction'],
            ['order' => 1]
        );
        Lesson::firstOrCreate(['section_id' => $section->id, 'title' => 'Présentation du cours'], [
            'type' => 'video', 'duration' => 900, 'is_free' => true, 'order' => 1,
        ]);
        Lesson::firstOrCreate(['section_id' => $section->id, 'title' => 'Qu\'est-ce que React ?'], [
            'type' => 'video', 'duration' => 1200, 'is_free' => true, 'order' => 2,
        ]);

        // ── Enrollment demo ───────────────────────────────────
        Enrollment::firstOrCreate(
            ['user_id' => $student->id, 'course_id' => $course->id],
            ['progress' => 65]
        );

        $this->command->info('✅ Seed terminé avec succès !');
        $this->command->table(
            ['Rôle', 'Email', 'Mot de passe'],
            [
                ['Admin',     'admin@xamxam.com',     'password'],
                ['Formateur', 'formateur@xamxam.com', 'password'],
                ['Apprenant', 'apprenant@xamxam.com', 'password'],
            ]
        );
    }
}
