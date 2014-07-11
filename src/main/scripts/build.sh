#!/bin/bash
BUILD_ENV="$1"   # mandatory (prod or dev)
TARGET_PATH="$2" # mandatory
VERSION="$3"     # optional
BUILD="$4"       # optional
DOJO_BUILD_PATH="$TARGET_PATH/../tmp/dojo"
DATE=$(date -u +"%FT%TZ")

if [ prod != "$BUILD_ENV" ] && [ dev != "$BUILD_ENV" ]; then
	echo "First parameter has to be a valid build environment (prod, dev)."
	exit 1
fi

if [[ -z "$TARGET_PATH" ]]; then
	echo "Second parameter has to be a valid target path."
	exit 1
fi

# Update submodules
git submodule update --init

# Write build version info into JavaScript file later used by Dojo and set build profile
if [ prod = "$BUILD_ENV" ]; then
	VERSION_FILE_CONTENT="define({ \
		version: \"$VERSION\", \
		commitId: \"$(git log -n 1 --pretty=format:%h)\", \
		buildTime: \"$DATE\", \
		buildNumber: \"$BUILD\" \
		});"
	DOJO_BUILD_PROFILE="libarsnova-application.prod"
else
	VERSION_FILE_CONTENT="define({ \
		version: \"DEVELOPMENT\", \
		commitId: \"\", \
		buildTime: \"$DATE\", \
		buildNumber: \"\" \
		});"
	DOJO_BUILD_PROFILE="libarsnova-application.dev"
fi
mkdir -p "$DOJO_BUILD_PATH/version"
echo "$VERSION_FILE_CONTENT" > "$DOJO_BUILD_PATH/version/version.js"

# Run Dojo build script
vendor/dojotoolkit.org/util/buildscripts/build.sh \
	profile="src/main/config/$DOJO_BUILD_PROFILE.profile.js" \
	releaseDir="$DOJO_BUILD_PATH"

# Copy Dojo application build
cp -R "$DOJO_BUILD_PATH/dojo/dojo.js" "$TARGET_PATH"/libarsnova.js
