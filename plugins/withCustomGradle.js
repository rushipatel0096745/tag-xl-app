const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withCustomGradle(config) {
    return withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        // 1. Use optimized proguard
        contents = contents.replace("proguard-android.txt", "proguard-android-optimize.txt");

        // 2. Force minifyEnabled true
        contents = contents.replace(/minifyEnabled\s+enableMinifyInReleaseBuilds/, "minifyEnabled true");

        // 3. Force shrinkResources true
        contents = contents.replace(
            /\/\/\s*shrinkResources\s+enableShrinkResources\.toBoolean\(\)/,
            "shrinkResources true"
        );
        // fallback if not commented
        contents = contents.replace(/shrinkResources\s+enableShrinkResources\.toBoolean\(\)/, "shrinkResources true");

        // 3. ABI splits
        if (!contents.includes("splits {")) {
            contents = contents.replace(
                "buildTypes {",
                `splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a", "x86_64"
            universalApk false
        }
    }

    buildTypes {`
            );
        }

        // 4. ABI version codes
        if (!contents.includes("abiCodes")) {
            contents += `
ext.abiCodes = ["armeabi-v7a": 1, "arm64-v8a": 2, "x86_64": 3]

android.applicationVariants.all { variant ->
    variant.outputs.each { output ->
        def baseAbiVersionCode = project.ext.abiCodes.get(
            output.getFilter(com.android.build.OutputFile.ABI)
        )
        if (baseAbiVersionCode != null) {
            output.versionCodeOverride =
                baseAbiVersionCode * 1000 + variant.versionCode
        }
    }
}
`;
        }

        config.modResults.contents = contents;
        return config;
    });
};
