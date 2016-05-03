(function() {
  'use strict';

  angular.module('oauth.oam', ['oauth.utils'])
    .factory('$ngCordovaOam', oam);

  function oam($q, $http, $cordovaOauthUtility) {
    return { signin: oauthOam };

    /*
     * Sign into the ADFS service (ADFS 3.0 onwards)
     *
     * @param    string clientId (client registered in ADFS, with redirect_uri configured to: http://localhost/callback)
     * @param  string adfsServer (url of the ADFS Server)
     * @param  string relyingPartyId (url of the Relying Party (resource relying on ADFS for authentication) configured in ADFS)
     * @return   promise
    */
    function oauthOam(usr, pass, url, options) {
      var deferred = $q.defer();
      var flagProceso = false;

      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open(url, '_blank', 'location=no,ignoresslerror=yes,ignoresslerror=yes,hidden=yes');

          

          browserRef.addEventListener("loadstop", function(event) {
            console.log("loadstop: " + event);

            console.log("URL: " + event.url);

            if(event.url.indexOf("login.html?") > -1 && flagProceso == false) {
              // Primera vez
              console.log("LOGIN INIT");
              flagProceso = true;

              browserRef.executeScript({
                code: " document.querySelector('#username').value = '" + usr +"'; document.querySelector('#password').value = '" + pass +"'; document.querySelector('#Formulario').submit(); "
              });

            } else if(event.url.indexOf(url) > -1 && flagProceso) {
              // Si recibi la url de callback y esta en proceso de login
              flagProceso = false;
              console.log("LOGIN OK!!!");
              deferred.resolve();
              browserRef.close();
            } else if(event.url.indexOf("login.html?") > -1 && flagProceso) {
              // Si entre a login estoy en proceso de login
              console.log("LOGIN ERROR!!!");
              deferred.reject();
              browserRef.close();

            }

          });

          browserRef.addEventListener("loaderror", function(event) {
            console.log("loaderror: " + event);
            deferred.reject("Hubo un problema al iniciar la sesion");
          });
          
          browserRef.addEventListener('exit', function(event) {
            deferred.reject("The sign in flow was canceled");
          });
        } else {
          deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }
      return deferred.promise;
    }
  }

  oam.$inject = ['$q', '$http', '$cordovaOauthUtility'];

})();
