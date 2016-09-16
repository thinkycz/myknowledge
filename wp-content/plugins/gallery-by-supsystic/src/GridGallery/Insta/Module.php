<?php


class GridGallery_Insta_Module extends Rsc_Mvc_Module
{

    protected $client;

    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        $environment = $this->getEnvironment();
        $config = $environment->getConfig();

        // Client ID
        $config->add('instagram_id', '1b449282e8a64f0e8265e4c39ce1b053');

        // Client Secret
        $config->add('instagram_secret', 'b40e0d148f4e4ee19b668a858f55ea04');

        // Authenticator's Instagram URL
        $config->add('instagram_redirect', 'http://supsystic.com/authenticator/index.php/authenticator/instagram');

        // Authenticator redirect uri
        /*$config->add(
            'instagram_state',
            $environment->generateUrl('insta', 'complete')
        );*/
    }

    /**
     * Returns Instagram client.
     *
     * @return GridGallery_Insta_Client
     */
    public function getClient($galleryId = 0)
    {
		$environment = $this->getEnvironment();

		if (!$this->client) {
            $config = $this->getEnvironment()->getConfig();
            $client = new GridGallery_Insta_Client();

            $client->setClientId($config->get('instagram_id'));
            $client->setClientSecret($config->get('instagram_secret'));
            $client->setRedirectUri($config->get('instagram_redirect'));
            $client->setState($config->get('instagram_state'));

            $this->client = $client;
        }

		$this->client->setState($environment->generateUrl('insta', 'complete', array('id' => $galleryId)));

        return $this->client;
    }
} 