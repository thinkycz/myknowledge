<?php

/**
 * Class SocialSharing_Promo_Module
 *
 * Promo module.
 */
class GridGallery_Promo_Module extends GridGallery_Core_Module
{
	/**
	 * Module initialization.
	 */
	public function onInit()
	{
		parent::onInit();
		
		add_action(
			$this->getConfig()->get('hooks_prefix') . 'after_ui_loaded', 
			array($this, 'loadAssets')
		);

		add_action('wp_ajax_sgg-tutorial-close', array($this, 'endTutorial'));
	}

	public function loadAssets(GridGallery_Ui_Module $ui) {
		if (!get_user_meta(get_current_user_id(), 'sgg-tutorial_was_showed', true)) {

			$ui->asset->enqueue('scripts', array(
				array(
					'handle' => 'sgg-step-tutorial',
					'source' => $this->getLocationUrl() . '/assets/js/tutorial.js',
					'dependencies' => array('wp-pointer')
				)
			));

			add_action('admin_enqueue_scripts', array($this, 'enqueueTutorialAssets'));

		}

		if ($this->isModule('promo', 'welcome') && !$this->getConfig()->get('welcome_page_was_showed')) {
			$ui->asset->enqueue('styles', array(
				$this->getConfig()->get('plugin_url') . '/app/assets/css/libraries/bootstrap/bootstrap.min.css'
			));
			update_option($this->getConfig()->get('db_prefix') . 'welcome_page_was_showed', 1);
		}
	}

	public function enqueueTutorialAssets() {

		wp_enqueue_style('wp-pointer');

		$data = array(
			'next'  => $this->translate('Next'),
			'close' => $this->translate('Close Tutorial'),
			'pointersData'	=> $this->pointers(),
			'startURL' => $this->getEnvironment()->generateUrl('overview'),
		);

		wp_localize_script('sgg-step-tutorial', 'GalleryPromoPointers', $data);
	}

	public function pointers()
	{
		return array(
			array(
				'id' => 'step-1',
				'class' => 'sgg-tutorial-step-1',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Hello! This is the Gallery by Supsystic. ')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Here you can get help: watch the video tutorial or read FAQ and Documentation, make use of contact form. Also here requirements for server - Server Settings.')),
				'target' => 'nav.supsystic-navigation li:eq(0)',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => $this->getEnvironment()->generateUrl('galleries', 'showPresets')
			),
			array(
				'id' => 'step-2',
				'class' => 'sgg-tutorial-step-2',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('First Step')),
				'content'   => sprintf('<p>%s</p>', $this->translate('To Create New Gallery select gallery template. You can change template and settings later. Now here are four different templates. With PRO version you’ll get more features like Categories, Load More button, Post Feed (Content) gallery, Polaroid gallery and more. Enter name of the gallery and click “Save”.')),
				'target' => '#gallery-create',
				'edge'	  => 'top',
				'align'	 => 'middle',
				'nextURL' => false,
			),
			array(
				'id' => 'step-3',
				'class' => 'sgg-tutorial-step-3',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Second Step')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Now you are in the edit menu of your gallery. And the first thing you need to do are add media to the gallery. Click "Add Images" button.')),
				'target' => 'button.gallery.import-to-gallery',
				'edge'	  => 'top',
				'align'	 => 'left',
				'nextURL' => false,
			),
			array(
				'id' => 'step-4',
				'class' => 'sgg-tutorial-step-4',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Second Step-2')),
				'content'   => sprintf('%s', $this->translate('<p>Import images in several ways:</p><p>Import from Wordpress Media Library/Upload files from your computer</p><p>Import from social networks</p><p>Instagram (in the Free version)</p><p>With PRO-version also will be available import from Flickr, Tumblr and Facebook.</p>')),
				'target' => 'button.gallery#gg-btn-upload',
				'edge'	  => 'left',
				'align'	 => 'top',
				'nextURL' => false,
			),
			array(
				'id' => 'step-5',
				'class' => 'sgg-tutorial-step-5',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Third Step')),
				'content'   => sprintf('%s', $this->translate('<p>Now you can see your image list. Here you can:</p><p>Change the order of images – simply by dragging them manually.</p><p>Delete images</p><p>Add new images from different sources to the grid gallery – click “Add Images” button and select the source to import from.</p><p><b>Caption tab</b> – add caption to image – it will be displayed on the caption effect of the gallery. Also here included the support of html-elements inside caption effect</p><p><b>SEO tab</b> – manage image title and description</p><p><b>Link tab</b> – attach links to image – it will go to the link when you click the image.</p><p><b>Video tab</b> – attach video url – it will be displayed in a pop-up image when you click on the image.</p><p><b>Categories tab</b> – add tags for image categories.</p><p>Now follow to the gallery settings – сlick “Properties” button.</p>')),
				'target' => '#supsystic-breadcrumbs',
				'edge'	  => 'top',
				'align'	 => 'right',
				'nextURL' => false,
			),
			array(
				'id' => 'step-6',
				'class' => 'sgg-tutorial-step-6',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Fourth Step')),
				'content'   => sprintf('<p>%s</p>', $this->translate('Gallery Properties: At the left side of the monitor you see a preview image in which will be seen changes made to the settings. This window for the settings of your gallery.')),
				'target' => '#preview .grid-gallery-caption',
				'edge'	  => 'left',
				'align'	 => 'top',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-7',
				'class' => 'sgg-tutorial-step-7',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Fourth Step-1')),
				'content'   => sprintf('%s', $this->translate('<p>Gallery Type: sets the look of your gallery for more information check this article. If you were chosen fixed column you\'ll see new tab where you can make a Number of Columns for your gallery.</p><p>Load More: adds a button to the page. And with Custom Buttons: you can make your button better.</p><p>Add to images border with Border Type and add shadow with Shadow.</p><p>Big image appear settings set in the Pop-up Image section.</p>')),
				'target' => '.supsystic-plugin .form-tabs a:eq(0)',
				'edge'	  => 'right',
				'align'	 => 'top',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-8',
				'class' => 'sgg-tutorial-step-8',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Five Step')),
				'content'   => sprintf('%s', $this->translate('<p>Captions: In this tab you can manage the captions and make them your style.</p>')),
				'target' => '.supsystic-plugin .form-tabs a:eq(1)',
				'edge'	  => 'right',
				'align'	 => 'top',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-9',
				'class' => 'sgg-tutorial-step-9',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Six Step')),
				'content'   => sprintf('%s', $this->translate('<p>Categories: Сategories option includes such capabilities:</p><p>Hide "all" category</p><p>Enable shuffling animation of images. (If you enable posts layout on the Posts tab – this feature will not be available).</p><p>Set the duration of animation.</p><p>Define the position of categories – over or under the gallery.</p><p>Determine the alignment of categories.</p><p>Set Categories order</p><p>To this tab become available you need to buy pro-version.')),
				'target' => '.supsystic-plugin .form-tabs a:eq(2)',
				'edge'	  => 'right',
				'align'	 => 'top',
				'nextURL' => '#',
			),
			array(
				'id' => 'step-10',
				'class' => 'sgg-tutorial-step-10',
				'title'	 => sprintf('<h3>%s</h3>', $this->translate('Seven Step')),
				'content'   => sprintf('%s', $this->translate('<p>Posts: Here you can add posts and pages to your gallery and also manage them. Posts of gallery included in the PRO version of Gallery by Supsystic.</p>')),
				'target' => '.supsystic-plugin .form-tabs a:eq(3)',
				'edge'	  => 'right',
				'align'	 => 'top',
				'nextURL' => '#',
			)
		);
	}

	public function endTutorial() {
		update_user_meta(get_current_user_id(), 'sgg-tutorial_was_showed', true);
	}
}