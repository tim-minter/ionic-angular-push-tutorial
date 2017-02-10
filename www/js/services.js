angular.module('starter.services', [])

.service('BluemixService', function ($window, $q) {

    this.connect = function (appGuid, clientSecret) {
        console.log("Service Called: " + appGuid + ":" + clientSecret);
        // create deferred object using $q
        var deferred = $q.defer();
        if (window.cordova) {
            console.log("We are running on a device or emulator so can connect to Bluemix and get a push deviceID")
            $window.BMSClient.initialize(BMSClient.REGION_UK); //if you have created your bluemix app in another region select from the following list BMSClient.REGION_US_SOUTH and BMSClient.REGION_SYDNEY
            var category = {};
            $window.BMSPush.initialize(appGuid, clientSecret, category);
            var success = function (message) { //fires on success of MFPPush.registerDevice
                console.log(message);
                var deviceId = JSON.parse(message).deviceId; //filter out the deviceID for use later eg if you want to associate the user with the device ID for targeted push notifications
                deferred.resolve(deviceId);
            };
            var failure = function (message) { //fires on failure of MFPPush.registerDevice
                console.log(message);
                deferred.reject(message); //return the full message which includes any errors
            };

            var options = {
                ios: {
                    alert: true,
                    badge: true,
                    sound: true
                }
            };

            var notification = function (notification) {
                //if we don't implement this then alerts are NOT displayed when the app is open
                alert(notification.message);
                //could do something like this using cordova toast plugin....
                //                $window.plugins.toast.showWithOptions({
                //                    message: notification.message,
                //                    duration: "long", // 2000 ms
                //                    position: "center",
                //                    styling: {
                //                        opacity: 1, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                //                        backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                //                        textColor: '#000000', // Ditto. Default #FFFFFF
                //                        textSize: 13, // Default is approx. 13.
                //                        cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                //                        horizontalPadding: 20, // iOS default 16, Android default 50
                //                        verticalPadding: 16 // iOS default 12, Android default 30
                //                    }
                //                });
            };
            $window.BMSPush.registerDevice(options, success, failure);
            $window.BMSPush.registerNotificationsCallback(notification);
            deviceId = deferred.promise;
        } else {
            console.log("We are looking at this in a web browser so we can't connect to Bluemix and get a deviceID")
            deferred.resolve("Web View"); //if we are running using ionic serve then we wont be abe to register for push.
            deviceId = deferred.promise;
        }
        return $q.when(deviceId);
    };
