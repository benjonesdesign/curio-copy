// Kotlin/JVM build for the generated copy strings, added 2026-08-28.
//
// Mirrors curio-contracts' own build deliberately — same plugin versions, same JVM target, same
// maven-publish setup — so Android consumes both packages through JitPack the same way. This
// package had NO Kotlin target at all, which is why Android was stubbing labels behind a single
// accessor: it could not consume @curio/copy even though the strings existed.
//
// No kotlinx-serialization here: this module emits plain string maps, not wire types.

plugins {
    kotlin("jvm") version "2.0.20"
    `maven-publish`
}

group = "com.github.benjonesdesign"
version = "0.0.0-local"

repositories {
    mavenCentral()
}

kotlin {
    // Bytecode compatible with Android's minimum JVM level without requiring a specific JDK
    // toolchain to be installed to BUILD this — same reasoning as curio-contracts.
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test { useJUnitPlatform() }

publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
            artifactId = "curio-copy"
        }
    }
}
