(function () {
  if (!window.Capacitor || !window.Capacitor.registerPlugin) {
    console.warn('Capacitor is not available. AdMob disabled.');
    return;
  }

  const AdMob = window.Capacitor.registerPlugin('AdMob');

  const TEST_INTERSTITIAL_ID =
    'ca-app-pub-3940256099942544/1033173712';

  let interstitialReady = false;
  let canRequestAds = false;

  async function initializeAdMob() {
    try {
      await AdMob.initialize({
        initializeForTesting: true
      });

      console.log('AdMob initialized');

      let consentInfo = await AdMob.requestConsentInfo();

      console.log(
        'AdMob consent status:',
        consentInfo.status
      );

      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === 'REQUIRED'
      ) {
        console.log('AdMob consent form required');

        consentInfo = await AdMob.showConsentForm();

        console.log(
          'AdMob consent form completed:',
          consentInfo.status
        );
      }

      canRequestAds = !!consentInfo.canRequestAds;

      console.log(
        'AdMob can request ads:',
        canRequestAds
      );

      if (canRequestAds) {
        await prepareInterstitial();
      } else {
        console.log(
          'AdMob cannot request ads until consent is available'
        );
      }

    } catch (error) {
      console.warn(
        'AdMob initialization/consent failed:',
        error
      );
    }
  }

  async function prepareInterstitial() {
    if (!canRequestAds) {
      console.log(
        'AdMob interstitial not prepared because ads cannot be requested'
      );
      return;
    }

    try {
      await AdMob.prepareInterstitial({
        adId: TEST_INTERSTITIAL_ID,
        isTesting: true
      });

      interstitialReady = true;

      console.log('AdMob interstitial ready');

    } catch (error) {
      interstitialReady = false;

      console.warn(
        'AdMob interstitial preparation failed:',
        error
      );
    }
  }

  async function showSafeCardAd() {
    if (!canRequestAds) {
      console.log(
        'AdMob cannot show an ad because consent is not available'
      );
      return;
    }

    if (!interstitialReady) {
      console.log(
        'AdMob interstitial is not ready'
      );

      await prepareInterstitial();
      return;
    }

    try {
      await AdMob.showInterstitial();

      interstitialReady = false;

      setTimeout(function () {
        prepareInterstitial();
      }, 1000);

    } catch (error) {
      console.warn(
        'AdMob interstitial could not be shown:',
        error
      );

      interstitialReady = false;

      prepareInterstitial();
    }
  }

  window.SafeCardAdMob = {
    initialize: initializeAdMob,
    show: showSafeCardAd
  };
})();