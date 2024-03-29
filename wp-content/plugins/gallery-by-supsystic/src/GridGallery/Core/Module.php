<?php

/**
 * Class GridGallery_Core_Module
 * Core module
 *
 * @package GridGallery\Core
 * @author Artur Kovalevsky
 */
class GridGallery_Core_Module extends Rsc_Mvc_Module
{
    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();
        $path = dirname(dirname(dirname(dirname(__FILE__))));
        $url = plugins_url(basename($path));
        $config = $this->getEnvironment()->getConfig();

        //Clear plugin cache after update
        $optionName = $config->get('hooks_prefix') . 'plugin_version';
        $currentVersion = $config->get('plugin_version');
        $oldVersion = get_option($optionName);

        if (version_compare($oldVersion, $currentVersion) === -1) {
            $this->cleanGalleryCache();
            update_option($optionName, $currentVersion);
        }

        $config->add('plugin_url', $url);
        $config->add('plugin_path', $path);

        $this->registerTwigFunctions();
        add_filter('gg_hooks_prefix', array($this, 'addHooksPrefix'), 10, 1);
    }

    /**
     * Adds the plugin's hooks prefix to the hook name
     *
     * @param string $hook The name of the hook
     * @return string
     */
    public function addHooksPrefix($hook)
    {
        $config = $this->getEnvironment()->getConfig();

        return $config->get('hooks_prefix') . $hook;
    }

    public function afterUiLoaded(Callable $callback)
    {
        if (!is_callable($callback)) {
            throw new InvalidArgumentException('$callback must be a callable');
        }

        add_action($this->addHooksPrefix('after_ui_loaded'), $callback);
    }

    public function getProUrl($params = null) {
        $config = $this->getConfig();
        return $config->get('page_url') . (strpos($params, '?') === 0 ? '' : '?') . $params;
    }

    public function buildProUrl(array $parameters = array())
    {
        $config = $this->getEnvironment()->getConfig();
        $homepage = 'https://supsystic.com/plugins/photo-gallery/';
        $campaign = 'gallery';

        if (!array_key_exists('utm_source', $parameters)) {
            $parameters['utm_source'] = 'plugin';
        }

        if (!array_key_exists('utm_campaign', $parameters)) {
            $parameters['utm_campaign'] = $campaign;
        }

        return $homepage . '?' . http_build_query($parameters);
    }

    private function registerTwigFunctions()
    {

        $twig = $this->getTwig();

        $twig->addFunction(
            new Twig_SimpleFunction(
                'build_pro_url', array($this, 'buildProUrl')
            )
        );

        $twig->addFunction(
            new Twig_SimpleFunction(
                'translate', array($this, 'translate')
            )
        );

        $twig->addFunction(
            new Twig_SimpleFunction(
                'getProUrl', array($this, 'getProUrl')
            )
        );

    }

    //Clear gallery cache after update
    private function cleanGalleryCache() {
        $cachePath = $this->getConfig()->get('plugin_cache_tables');
        if ($cachePath) {
            array_map('unlink', glob("$cachePath/*"));
        }
    }
}
