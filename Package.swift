// swift-tools-version:5.10
import PackageDescription

let package = Package(
    name: "CurioCopy",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "CurioCopy", targets: ["CurioCopy"])
    ],
    targets: [
        .target(name: "CurioCopy", path: "Sources/CurioCopy"),
        .testTarget(name: "CurioCopyTests", dependencies: ["CurioCopy"], path: "Tests/CurioCopyTests"),
    ]
)
