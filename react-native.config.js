module.exports = {
  dependencies: {
    // Force a specific version of Folly that's compatible with newer iOS SDKs
    folly: {
      platforms: {
        ios: {
          extraFlags: [
            "-DFOLLY_HAVE_ALIGNED_NEW=0",
            "-DFOLLY_CFG_NO_COROUTINES=1",
          ],
          scriptPhases: [
            {
              name: "Fix Folly Build Issues",
              path: "./ios/fix_rn_build.sh",
              execution_position: "after_compile",
            },
          ],
        },
      },
    },
  },
};
