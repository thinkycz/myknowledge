<?php
/** Enable W3 Total Cache */
define('WP_CACHE', true); // Added by W3 Total Cache

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'd127911_wp');

/** MySQL database username */
define('DB_USER', 'a127911_wp');

/** MySQL database password */
define('DB_PASSWORD', '3qHFWNmC');

/** MySQL hostname */
define('DB_HOST', 'wm111.wedos.net');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '{G/e)I^e1S&16`H-DPS[`M_E@cD/K#<E&217;35`&9kOks}^2r!Q%tLK~H3.)~2|');
define('SECURE_AUTH_KEY',  'tp9n&TS@t%))IlH ,jp1^yYv,tqCX{+99I^$<ix=>Ce5x;p==vaP-@T|#J]=;[>d');
define('LOGGED_IN_KEY',    'AF8wy>Il8Ombnx&+7#b3xI-H-FHwm>i8p7$Z4pqm|Q,`IW-$}Fh|w!c!7-H}eU`P');
define('NONCE_KEY',        'Y++rX-Zj5x 4,RbA<c#3>e-((5E.2$2R<=4r2><`;&C?-u-[Relp,5e`-([kK@ L');
define('AUTH_SALT',        'nZVNCMsRW;jIY|s pn1G[.j n>+|MGGWT vv),)zn6~m@$SYU1W3w;mW1<8o8I|r');
define('SECURE_AUTH_SALT', 'S,++<H}$O-ZiLT+`]uuNK]Uct^dd=)eA5tzJ0P1qPb0z|wE>5m*[}&Rzg|KVn,[z');
define('LOGGED_IN_SALT',   '`f2MviWAa&zNHucTzna8 gw^6H^,KVEMOba2Dp4?4qEO;+6CA~Y;~R!8761#aG?<');
define('NONCE_SALT',       '.#-;f}p.:]dX-G_6td$HKfsS-`!n>Tp7~%:$$aXeYJXca+ze(j|<qon:c/A)d][-');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
